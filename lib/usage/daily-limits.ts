import { db } from '@/lib/db';
import { dailyUsage, userStats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { DAILY_FREE_LIMIT } from '@/lib/constants';
import { getUTCDateString } from '@/lib/utils';

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  canAnalyze: boolean;
}

export async function checkDailyLimit(userId: string): Promise<UsageInfo> {
  const today = getUTCDateString();

  const [usage] = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)));

  const used = usage?.usageCount ?? 0;
  const remaining = Math.max(0, DAILY_FREE_LIMIT - used);

  return {
    used,
    limit: DAILY_FREE_LIMIT,
    remaining,
    canAnalyze: remaining > 0,
  };
}

export async function incrementUsage(userId: string): Promise<UsageInfo> {
  const today = getUTCDateString();

  const [existing] = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)));

  if (existing) {
    await db
      .update(dailyUsage)
      .set({ usageCount: existing.usageCount + 1 })
      .where(eq(dailyUsage.id, existing.id));
  } else {
    await db.insert(dailyUsage).values({
      userId,
      date: today,
      usageCount: 1,
    });
  }

  // Update user stats
  const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));

  if (stats) {
    const lastActivity = stats.lastActivityDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getUTCDateString(yesterday);

    let newStreak = stats.currentStreak;
    if (lastActivity === yesterdayStr) {
      newStreak = stats.currentStreak + 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }

    await db
      .update(userStats)
      .set({
        totalAnalyses: stats.totalAnalyses + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastActivityDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));
  } else {
    await db.insert(userStats).values({
      userId,
      totalAnalyses: 1,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
    });
  }

  return checkDailyLimit(userId);
}
