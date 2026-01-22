'use server';

import { db } from '@/lib/db';
import { users, userStats, UserRole, UserStatus } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { eq, ilike, or, desc, asc, count } from 'drizzle-orm';
import * as v from 'valibot';

const GetAdminUsersSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
  search: v.optional(v.string()),
  sortBy: v.optional(v.picklist(['createdAt', 'lastActivityAt', 'totalAnalyses']), 'createdAt'),
  sortDirection: v.optional(v.picklist(['asc', 'desc']), 'desc'),
});

export type GetAdminUsersInput = v.InferInput<typeof GetAdminUsersSchema>;

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
  lastActivityAt: Date | null;
  totalAnalyses: number;
  totalWordsLearned: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAdminUsersResult {
  success: boolean;
  data?: {
    users: AdminUser[];
    pagination: PaginationInfo;
  };
  error?: string;
}

export async function getAdminUsers(input: GetAdminUsersInput = {}): Promise<GetAdminUsersResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(GetAdminUsersSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { page, limit, search, sortBy, sortDirection } = parseResult.output;
  const offset = (page - 1) * limit;

  try {
    // Build search condition
    const searchCondition = search
      ? or(
          ilike(users.email, `%${search}%`),
          ilike(users.name, `%${search}%`)
        )
      : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: count() })
      .from(users)
      .where(searchCondition);
    const total = countResult?.count ?? 0;

    // Build sort order
    const sortColumn = sortBy === 'lastActivityAt' 
      ? userStats.lastActivityDate
      : sortBy === 'totalAnalyses'
      ? userStats.totalAnalyses
      : users.createdAt;
    
    const orderFn = sortDirection === 'asc' ? asc : desc;

    // Get users with stats
    const usersData = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        status: users.status,
        role: users.role,
        createdAt: users.createdAt,
        lastActivityDate: userStats.lastActivityDate,
        totalAnalyses: userStats.totalAnalyses,
        totalWordsLearned: userStats.totalWordsLearned,
      })
      .from(users)
      .leftJoin(userStats, eq(users.id, userStats.userId))
      .where(searchCondition)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    const adminUsers: AdminUser[] = usersData.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status as UserStatus,
      role: u.role as UserRole,
      createdAt: u.createdAt,
      lastActivityAt: u.lastActivityDate ? new Date(u.lastActivityDate) : null,
      totalAnalyses: u.totalAnalyses ?? 0,
      totalWordsLearned: u.totalWordsLearned ?? 0,
    }));

    return {
      success: true,
      data: {
        users: adminUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Failed to get admin users:', error);
    return { success: false, error: 'Failed to retrieve users' };
  }
}
