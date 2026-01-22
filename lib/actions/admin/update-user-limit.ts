'use server';

import { db } from '@/lib/db';
import { userLimits, adminLogs } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const UpdateUserLimitSchema = v.object({
  userId: v.pipe(v.string(), v.uuid()),
  dailyLimit: v.pipe(v.number(), v.minValue(1), v.maxValue(1000)),
});

export type UpdateUserLimitInput = v.InferInput<typeof UpdateUserLimitSchema>;

export interface UpdateUserLimitResult {
  success: boolean;
  data?: {
    userId: string;
    dailyLimit: number;
  };
  error?: string;
}

export async function updateUserLimit(input: UpdateUserLimitInput): Promise<UpdateUserLimitResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(UpdateUserLimitSchema, input);
  if (!parseResult.success) {
    const issues = parseResult.issues.map(i => i.message).join(', ');
    return { success: false, error: `Invalid input: ${issues}` };
  }

  const { userId, dailyLimit } = parseResult.output;

  try {
    // Check if user limit record exists
    const [existingLimit] = await db
      .select()
      .from(userLimits)
      .where(eq(userLimits.userId, userId));

    if (existingLimit) {
      // Update existing limit
      await db
        .update(userLimits)
        .set({ 
          dailyLimit, 
          updatedAt: new Date() 
        })
        .where(eq(userLimits.userId, userId));
    } else {
      // Create new limit record
      await db.insert(userLimits).values({
        userId,
        dailyLimit,
      });
    }

    // Log the action
    await db.insert(adminLogs).values({
      adminId: adminCheck.data!.id,
      action: 'role_changed', // Using existing action type for now
      targetType: 'user_limit',
      targetId: userId,
      details: { 
        previousLimit: existingLimit?.dailyLimit ?? 10,
        newLimit: dailyLimit,
      },
    });

    return {
      success: true,
      data: {
        userId,
        dailyLimit,
      },
    };
  } catch (error) {
    console.error('Failed to update user limit:', error);
    return { success: false, error: 'Failed to update user limit' };
  }
}
