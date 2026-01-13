'use server';

import { db } from '@/lib/db';
import { users, userStats, UserRole, UserStatus } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/admin/middleware';
import { isSuperAdminRole } from '@/lib/admin/utils';
import * as v from 'valibot';

const CreateUserSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  name: v.optional(v.string()),
  role: v.optional(v.picklist(['user', 'admin', 'super_admin']), 'user'),
  status: v.optional(v.picklist(['active', 'suspended']), 'active'),
  motherLanguage: v.optional(v.string(), 'zh-cn'),
  learningLanguage: v.optional(v.string(), 'en'),
  proficiencyLevel: v.optional(v.picklist(['beginner', 'intermediate', 'advanced']), 'beginner'),
});

export type CreateUserInput = v.InferInput<typeof CreateUserSchema>;

export interface CreateUserResult {
  success: boolean;
  data?: {
    id: string;
    email: string;
  };
  error?: string;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(CreateUserSchema, input);
  if (!parseResult.success) {
    const issues = parseResult.issues.map(i => i.message).join(', ');
    return { success: false, error: `Invalid input: ${issues}` };
  }

  const { email, name, role, status, motherLanguage, learningLanguage, proficiencyLevel } = parseResult.output;

  // Only super_admin can create admin or super_admin users
  if ((role === 'admin' || role === 'super_admin') && !isSuperAdminRole(adminCheck.data!.role)) {
    return { success: false, error: 'Only super admins can create admin users' };
  }

  try {
    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists' };
    }

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      name: name || null,
      role: role as UserRole,
      status: status as UserStatus,
      motherLanguage,
      learningLanguage,
      proficiencyLevel,
    }).returning({ id: users.id, email: users.email });

    // Initialize user stats
    await db.insert(userStats).values({
      userId: newUser.id,
      totalWordsLearned: 0,
      totalAnalyses: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    return {
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
      },
    };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}
