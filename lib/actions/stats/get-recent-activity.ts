'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { dailyUsage, type DailyUsage } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

interface GetRecentActivityResult {
  success: boolean;
  data?: DailyUsage[];
  error?: string;
}

export async function getRecentActivity(days: number = 7): Promise<GetRecentActivityResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

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
    data: activity,
  };
}
