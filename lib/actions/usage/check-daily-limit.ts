'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { dailyUsage, userLimits } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUTCDateString } from '@/lib/utils';
import * as v from 'valibot';

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  canAnalyze: boolean;
}

const inputSchema = v.object({
  userId: v.optional(v.pipe(v.string(), v.uuid())),
});

interface CheckDailyLimitResult {
  success: boolean;
  data?: UsageInfo;
  error?: string;
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

export async function checkDailyLimit(
  input: v.InferInput<typeof inputSchema> = {}
): Promise<CheckDailyLimitResult> {
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

  const [usage] = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)));

  const used = usage?.usageCount ?? 0;
  const remaining = Math.max(0, dailyLimit - used);

  return {
    success: true,
    data: {
      used,
      limit: dailyLimit,
      remaining,
      canAnalyze: remaining > 0,
    },
  };
}
