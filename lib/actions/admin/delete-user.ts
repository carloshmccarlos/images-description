'use server';

import { db } from '@/lib/db';
import { users, adminLogs, savedAnalyses } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/admin/middleware';
import { isSuperAdminRole } from '@/lib/admin/utils';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const DeleteUserSchema = v.object({
  userId: v.pipe(v.string(), v.uuid()),
  reason: v.optional(v.string()),
});

export type DeleteUserInput = v.InferInput<typeof DeleteUserSchema>;

export interface DeleteUserResult {
  success: boolean;
  error?: string;
}

export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(DeleteUserSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { userId, reason } = parseResult.output;

  // Prevent admin from deleting themselves
  if (userId === adminCheck.data!.id) {
    return { success: false, error: 'Cannot delete your own account' };
  }

  try {
    // Get existing user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    // Only super_admin can delete admin or super_admin users
    if ((existingUser.role === 'admin' || existingUser.role === 'super_admin') && 
        !isSuperAdminRole(adminCheck.data!.role)) {
      return { success: false, error: 'Only super admins can delete admin users' };
    }

    // Get user's saved analyses to clean up images (optional - R2 cleanup)
    const userAnalyses = await db
      .select({ imageUrl: savedAnalyses.imageUrl })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId));

    // Log the deletion before deleting (so we have a record)
    await db.insert(adminLogs).values({
      adminId: adminCheck.data!.id,
      action: 'content_deleted',
      targetType: 'user',
      targetId: userId,
      details: { 
        email: existingUser.email,
        reason: reason || 'No reason provided',
        analysesCount: userAnalyses.length,
      },
    });

    // Delete user (cascade will handle related records)
    await db.delete(users).where(eq(users.id, userId));

    // TODO: Clean up R2 images if needed
    // for (const analysis of userAnalyses) {
    //   await deleteFromR2(analysis.imageUrl);
    // }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
