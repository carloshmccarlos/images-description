'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { dailyUsage, userStats, userLimits } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUTCDateString } from '@/lib/utils';
import type { UsageInfo } from './check-daily-limit';
import * as v from 'valibot';

async function resolveDailyLimit(userId: string): Promise<number> {
  const [limitRow] = await db
    .select({ dailyLimit: userLimits.dailyLimit })
    .from(userLimits)
    .where(eq(userLimits.userId, userId));

  if (limitRow?.dailyLimit && limitRow.dailyLimit > 0) {
    return limitRow.dailyLimit;
  }

  return 10;
}

const inputSchema = v.object({
  userId: v.optional(v.pipe(v.string(), v.uuid())),
});

interface IncrementUsageResult {
  success: boolean;
  data?: UsageInfo;
  error?: string;
}

export async function incrementUsage(
  input: v.InferInput<typeof inputSchema> = {}
): Promise<IncrementUsageResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const userId = validated.output.userId ?? user.id;
  if (validated.output.userId && validated.output.userId !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

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
    success: true,
    data: {
      used: (existing?.usageCount ?? 0) + 1,
      limit: dailyLimit,
      remaining: Math.max(0, dailyLimit - ((existing?.usageCount ?? 0) + 1)),
      canAnalyze: dailyLimit - ((existing?.usageCount ?? 0) + 1) > 0,
    },
  };
}
