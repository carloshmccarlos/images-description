'use server';

import { db } from '@/lib/db';
import { users, adminLogs, UserRole, UserStatus } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { isSuperAdminRole } from '@/lib/admin/utils';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const UpdateUserSchema = v.object({
  userId: v.pipe(v.string(), v.uuid()),
  email: v.optional(v.pipe(v.string(), v.email())),
  name: v.optional(v.string()),
  role: v.optional(v.picklist(['user', 'admin', 'super_admin'])),
  status: v.optional(v.picklist(['active', 'suspended'])),
  motherLanguage: v.optional(v.string()),
  learningLanguage: v.optional(v.string()),
  proficiencyLevel: v.optional(v.picklist(['beginner', 'intermediate', 'advanced'])),
});

export type UpdateUserInput = v.InferInput<typeof UpdateUserSchema>;

export interface UpdateUserResult {
  success: boolean;
  data?: {
    id: string;
    email: string;
  };
  error?: string;
}

export async function updateUser(input: UpdateUserInput): Promise<UpdateUserResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(UpdateUserSchema, input);
  if (!parseResult.success) {
    const issues = parseResult.issues.map(i => i.message).join(', ');
    return { success: false, error: `Invalid input: ${issues}` };
  }

  const { userId, email, name, role, status, motherLanguage, learningLanguage, proficiencyLevel } = parseResult.output;

  try {
    // Get existing user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    // Only super_admin can change roles to admin or super_admin
    if (role && (role === 'admin' || role === 'super_admin') && !isSuperAdminRole(adminCheck.data!.role)) {
      return { success: false, error: 'Only super admins can assign admin roles' };
    }

    // Prevent changing own role (to avoid locking yourself out)
    if (userId === adminCheck.data!.id && role && role !== adminCheck.data!.role) {
      return { success: false, error: 'Cannot change your own role' };
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });
      if (emailExists) {
        return { success: false, error: 'Email is already in use' };
      }
    }

    // Build update object
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name || null;
    if (role !== undefined) updateData.role = role as UserRole;
    if (status !== undefined) updateData.status = status as UserStatus;
    if (motherLanguage !== undefined) updateData.motherLanguage = motherLanguage;
    if (learningLanguage !== undefined) updateData.learningLanguage = learningLanguage;
    if (proficiencyLevel !== undefined) updateData.proficiencyLevel = proficiencyLevel;

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email });

    // Log role change if applicable
    if (role && role !== existingUser.role) {
      await db.insert(adminLogs).values({
        adminId: adminCheck.data!.id,
        action: 'role_changed',
        targetType: 'user',
        targetId: userId,
        details: { 
          previousRole: existingUser.role, 
          newRole: role 
        },
      });
    }

    // Log status change if applicable
    if (status && status !== existingUser.status) {
      await db.insert(adminLogs).values({
        adminId: adminCheck.data!.id,
        action: status === 'suspended' ? 'user_suspended' : 'user_reactivated',
        targetType: 'user',
        targetId: userId,
        details: {},
      });
    }

    return {
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}
