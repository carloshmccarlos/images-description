import { db } from '@/lib/db';
import { dailyUsage, userStats, userLimits } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUTCDateString } from '@/lib/utils';

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  canAnalyze: boolean;
}

async function resolveDailyLimit(userId: string): Promise<number> {
  const [limitRow] = await db
    .select({ dailyLimit: userLimits.dailyLimit })
    .from(userLimits)
    .where(eq(userLimits.userId, userId));

  if (limitRow?.dailyLimit && limitRow.dailyLimit > 0) {
    return limitRow.dailyLimit;
  }

  // Fallback default if no custom row exists
  return 10;
}

export async function checkDailyLimit(userId: string): Promise<UsageInfo> {
  const today = getUTCDateString();
  const dailyLimit = await resolveDailyLimit(userId);

  const [usage] = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)));

  const used = usage?.usageCount ?? 0;
  const remaining = Math.max(0, dailyLimit - used);

  return {
    used,
    limit: dailyLimit,
    remaining,
    canAnalyze: remaining > 0,
  };
}

export async function incrementUsage(userId: string): Promise<UsageInfo> {
  const today = getUTCDateString();
  const dailyLimit = await resolveDailyLimit(userId);

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

  return {
    used: (existing?.usageCount ?? 0) + 1,
    limit: dailyLimit,
    remaining: Math.max(0, dailyLimit - ((existing?.usageCount ?? 0) + 1)),
    canAnalyze: dailyLimit - ((existing?.usageCount ?? 0) + 1) > 0,
  };
}
