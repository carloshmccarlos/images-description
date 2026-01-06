'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { dailyUsage } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

interface DailyUsageData {
  date: string;
  usageCount: number;
}

interface GetDailyUsageResult {
  success: boolean;
  data?: DailyUsageData;
  error?: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getDailyUsage(date?: string): Promise<GetDailyUsageResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const targetDate = date || getTodayDate();

  const [usage] = await db
    .select()
    .from(dailyUsage)
    .where(sql`${dailyUsage.userId} = ${user.id} AND ${dailyUsage.date} = ${targetDate}`);

  return {
    success: true,
    data: {
      date: targetDate,
      usageCount: usage?.usageCount || 0,
    },
  };
}
