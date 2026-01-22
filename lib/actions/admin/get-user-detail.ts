'use server';

import { db } from '@/lib/db';
import { users, userStats, savedAnalyses, userLimits, UserRole, UserStatus } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { eq, desc } from 'drizzle-orm';
import * as v from 'valibot';

const GetUserDetailSchema = v.object({
  userId: v.pipe(v.string(), v.uuid()),
});

export type GetUserDetailInput = v.InferInput<typeof GetUserDetailSchema>;

export interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  status: UserStatus;
  role: UserRole;
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  dailyLimit: number;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalWordsLearned: number;
    totalAnalyses: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
  };
  recentAnalyses: Array<{
    id: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
  }>;
}

export interface GetUserDetailResult {
  success: boolean;
  data?: UserDetail;
  error?: string;
}

export async function getUserDetail(input: GetUserDetailInput): Promise<GetUserDetailResult> {
  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  // Validate input
  const parseResult = v.safeParse(GetUserDetailSchema, input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid user ID' };
  }

  const { userId } = parseResult.output;

  try {
    // Get user with stats
    const [userData] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        status: users.status,
        role: users.role,
        motherLanguage: users.motherLanguage,
        learningLanguage: users.learningLanguage,
        proficiencyLevel: users.proficiencyLevel,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalWordsLearned: userStats.totalWordsLearned,
        totalAnalyses: userStats.totalAnalyses,
        currentStreak: userStats.currentStreak,
        longestStreak: userStats.longestStreak,
        lastActivityDate: userStats.lastActivityDate,
        dailyLimit: userLimits.dailyLimit,
      })
      .from(users)
      .leftJoin(userStats, eq(users.id, userStats.userId))
      .leftJoin(userLimits, eq(users.id, userLimits.userId))
      .where(eq(users.id, userId));

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Get recent analyses (last 10)
    const recentAnalysesData = await db
      .select({
        id: savedAnalyses.id,
        description: savedAnalyses.description,
        imageUrl: savedAnalyses.imageUrl,
        createdAt: savedAnalyses.createdAt,
      })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId))
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(10);

    const userDetail: UserDetail = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      status: userData.status as UserStatus,
      role: userData.role as UserRole,
      motherLanguage: userData.motherLanguage || 'zh-cn',
      learningLanguage: userData.learningLanguage || 'en',
      proficiencyLevel: userData.proficiencyLevel || 'beginner',
      dailyLimit: userData.dailyLimit ?? 10,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      stats: {
        totalWordsLearned: userData.totalWordsLearned ?? 0,
        totalAnalyses: userData.totalAnalyses ?? 0,
        currentStreak: userData.currentStreak ?? 0,
        longestStreak: userData.longestStreak ?? 0,
        lastActivityDate: userData.lastActivityDate ? new Date(userData.lastActivityDate) : null,
      },
      recentAnalyses: recentAnalysesData.map(a => ({
        id: a.id,
        description: a.description,
        imageUrl: a.imageUrl,
        createdAt: a.createdAt,
      })),
    };

    return {
      success: true,
      data: userDetail,
    };
  } catch (error) {
    console.error('Failed to get user detail:', error);
    return { success: false, error: 'Failed to retrieve user details' };
  }
}
