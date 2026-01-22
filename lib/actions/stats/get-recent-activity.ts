'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { dailyUsage } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import * as v from 'valibot';
import type { DailyUsageSummary } from '@/lib/types/stats';

interface GetRecentActivityResult {
  success: boolean;
  data?: DailyUsageSummary[];
  error?: string;
}

const inputSchema = v.object({
  days: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(30))),
});

export async function getRecentActivity(
  input: v.InferInput<typeof inputSchema> = {}
): Promise<GetRecentActivityResult> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const days = validated.output.days ?? 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const activity = await db
    .select()
    .from(dailyUsage)
    .where(sql`${dailyUsage.userId} = ${user.id} AND ${dailyUsage.date} >= ${startDateStr}`)
    .orderBy(desc(dailyUsage.date));

  return {
    success: true,
    data: activity.map((item) => ({
      date: item.date,
      usageCount: item.usageCount,
    })),
  };
}
