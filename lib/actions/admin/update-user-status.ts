'use server';

import { db } from '@/lib/db';
import { users, adminLogs, UserStatus } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const UpdateUserStatusSchema = v.object({
  userId: v.pipe(v.string(), v.uuid()),
  action: v.picklist(['suspend', 'reactivate']),
  reason: v.optional(v.string()),
});

export type UpdateUserStatusInput = v.InferInput<typeof UpdateUserStatusSchema>;

export interface UpdateUserStatusResult {
  success: boolean;
  data?: {
    userId: string;
    status: UserStatus;
  };
  error?: string;
}

export async function updateUserStatus(input: UpdateUserStatusInput): Promise<UpdateUserStatusResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(UpdateUserStatusSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { userId, action, reason } = parseResult.output;

  // Prevent admin from suspending themselves
  if (userId === adminCheck.data!.id) {
    return { success: false, error: 'Cannot suspend your own account' };
  }

  try {
    // Check if user exists
    const [existingUser] = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    // Determine new status
    const newStatus: UserStatus = action === 'suspend' ? 'suspended' : 'active';

    // Update user status
    await db
      .update(users)
      .set({ 
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Create activity log
    await db.insert(adminLogs).values({
      adminId: adminCheck.data!.id,
      action: action === 'suspend' ? 'user_suspended' : 'user_reactivated',
      targetType: 'user',
      targetId: userId,
      details: reason ? { reason } : {},
    });

    return {
      success: true,
      data: {
        userId,
        status: newStatus,
      },
    };
  } catch (error) {
    console.error('Failed to update user status:', error);
    return { success: false, error: 'Failed to update user status' };
  }
}
