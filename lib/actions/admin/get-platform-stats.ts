'use server';

import { db } from '@/lib/db';
import { users, savedAnalyses, userStats, dailyUsage } from '@/lib/db/schema';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';
import { count, sum, sql, gte, eq } from 'drizzle-orm';
import * as v from 'valibot';

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface PlatformStatsResult {
  success: boolean;
  data?: {
    totalUsers: number;
    totalAnalyses: number;
    dailyActiveUsers: number;
    totalWordsLearned: number;
    userGrowth: TimeSeriesDataPoint[];
    analysisGrowth: TimeSeriesDataPoint[];
  };
  error?: string;
}

export async function getPlatformStats(): Promise<PlatformStatsResult> {
  const validated = v.safeParse(v.object({}), {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Get total users count
    const [usersResult] = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = usersResult?.count ?? 0;

    // Get total analyses count
    const [analysesResult] = await db
      .select({ count: count() })
      .from(savedAnalyses);
    const totalAnalyses = analysesResult?.count ?? 0;

    // Get total words learned
    const [wordsResult] = await db
      .select({ total: sum(userStats.totalWordsLearned) })
      .from(userStats);
    const totalWordsLearned = Number(wordsResult?.total ?? 0);

    // Get daily active users (users with activity today)
    const today = new Date().toISOString().split('T')[0];
    const [dauResult] = await db
      .select({ count: count() })
      .from(dailyUsage)
      .where(eq(dailyUsage.date, today));
    const dailyActiveUsers = dauResult?.count ?? 0;

    // Get user registrations for past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowthData = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Get analyses for past 30 days
    const analysisGrowthData = await db
      .select({
        date: sql<string>`DATE(${savedAnalyses.createdAt})`,
        count: count(),
      })
      .from(savedAnalyses)
      .where(gte(savedAnalyses.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${savedAnalyses.createdAt})`)
      .orderBy(sql`DATE(${savedAnalyses.createdAt})`);

    // Fill in missing dates with zero counts
    const userGrowth = fillMissingDates(userGrowthData, thirtyDaysAgo);
    const analysisGrowth = fillMissingDates(analysisGrowthData, thirtyDaysAgo);

    return {
      success: true,
      data: {
        totalUsers,
        totalAnalyses,
        dailyActiveUsers,
        totalWordsLearned,
        userGrowth,
        analysisGrowth,
      },
    };
  } catch (error) {
    console.error('Failed to get platform stats:', error);
    return { success: false, error: 'Failed to retrieve platform statistics' };
  }
}

function fillMissingDates(
  data: { date: string; count: number }[],
  startDate: Date
): TimeSeriesDataPoint[] {
  const result: TimeSeriesDataPoint[] = [];
  const dataMap = new Map(data.map(d => [d.date, d.count]));
  
  const current = new Date(startDate);
  const today = new Date();
  
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dataMap.get(dateStr) ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}
