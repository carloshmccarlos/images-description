'use server';

import { db } from '@/lib/db';
import { dailyUsage, userLimits } from '@/lib/db/schema';
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
