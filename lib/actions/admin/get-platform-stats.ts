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
    const today = new Date().toISOString().split('T')[0];
    const [usersRows, analysesRows, wordsRows, dauRows] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(savedAnalyses),
      db.select({ total: sum(userStats.totalWordsLearned) }).from(userStats),
      db.select({ count: count() }).from(dailyUsage).where(eq(dailyUsage.date, today)),
    ]);

    const totalUsers = usersRows[0]?.count ?? 0;
    const totalAnalyses = analysesRows[0]?.count ?? 0;
    const totalWordsLearned = Number(wordsRows[0]?.total ?? 0);
    const dailyActiveUsers = dauRows[0]?.count ?? 0;

    // Get user registrations for past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [userGrowthData, analysisGrowthData] = await Promise.all([
      db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count(),
        })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`),
      db
        .select({
          date: sql<string>`DATE(${savedAnalyses.createdAt})`,
          count: count(),
        })
        .from(savedAnalyses)
        .where(gte(savedAnalyses.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${savedAnalyses.createdAt})`)
        .orderBy(sql`DATE(${savedAnalyses.createdAt})`),
    ]);

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
