'use server';

import { db } from '@/lib/db';
import { adminLogs, users, AdminAction } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { eq, gte, lte, and, desc, count } from 'drizzle-orm';
import * as v from 'valibot';

const GetActivityLogsSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 50),
  actionType: v.optional(v.picklist([
    'user_suspended',
    'user_reactivated',
    'content_flagged',
    'content_deleted',
    'role_changed',
  ])),
  dateFrom: v.optional(v.pipe(v.string(), v.isoDate())),
  dateTo: v.optional(v.pipe(v.string(), v.isoDate())),
});

export type GetActivityLogsInput = v.InferInput<typeof GetActivityLogsSchema>;

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string | null;
  action: AdminAction;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetActivityLogsResult {
  success: boolean;
  data?: {
    logs: AdminActivityLog[];
    pagination: PaginationInfo;
  };
  error?: string;
}

export async function getActivityLogs(
  input: GetActivityLogsInput = {}
): Promise<GetActivityLogsResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(GetActivityLogsSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { page, limit, actionType, dateFrom, dateTo } = parseResult.output;
  const offset = (page - 1) * limit;

  try {
    // Build filter conditions
    const conditions = [];
    if (actionType) {
      conditions.push(eq(adminLogs.action, actionType));
    }
    if (dateFrom) {
      conditions.push(gte(adminLogs.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(adminLogs.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countRows, logsData] = await Promise.all([
      db
        .select({ count: count() })
        .from(adminLogs)
        .where(whereClause),
      db
        .select({
          id: adminLogs.id,
          adminId: adminLogs.adminId,
          adminEmail: users.email,
          adminName: users.name,
          action: adminLogs.action,
          targetType: adminLogs.targetType,
          targetId: adminLogs.targetId,
          details: adminLogs.details,
          createdAt: adminLogs.createdAt,
        })
        .from(adminLogs)
        .innerJoin(users, eq(adminLogs.adminId, users.id))
        .where(whereClause)
        .orderBy(desc(adminLogs.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countRows[0]?.count ?? 0;

    const logs: AdminActivityLog[] = logsData.map(log => ({
      id: log.id,
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      adminName: log.adminName,
      action: log.action as AdminAction,
      targetType: log.targetType,
      targetId: log.targetId,
      details: (log.details as Record<string, unknown>) || {},
      createdAt: log.createdAt,
    }));

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return { success: false, error: 'Failed to retrieve activity logs' };
  }
}
