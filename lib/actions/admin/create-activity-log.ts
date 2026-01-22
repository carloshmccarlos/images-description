'use server';

import { db } from '@/lib/db';
import { adminLogs, AdminAction } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import * as v from 'valibot';

const CreateActivityLogSchema = v.object({
  action: v.picklist([
    'user_suspended',
    'user_reactivated',
    'content_flagged',
    'content_deleted',
    'role_changed',
  ]),
  targetType: v.picklist(['user', 'content', 'system']),
  targetId: v.string(),
  details: v.optional(v.record(v.string(), v.unknown())),
});

export type CreateActivityLogInput = v.InferInput<typeof CreateActivityLogSchema>;

export interface CreateActivityLogResult {
  success: boolean;
  data?: {
    logId: string;
  };
  error?: string;
}

export async function createActivityLog(
  input: CreateActivityLogInput
): Promise<CreateActivityLogResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(CreateActivityLogSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { action, targetType, targetId, details } = parseResult.output;

  try {
    const [log] = await db
      .insert(adminLogs)
      .values({
        adminId: adminCheck.data!.id,
        action: action as AdminAction,
        targetType,
        targetId,
        details: details || {},
      })
      .returning({ id: adminLogs.id });

    return {
      success: true,
      data: {
        logId: log.id,
      },
    };
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return { success: false, error: 'Failed to create activity log' };
  }
}
