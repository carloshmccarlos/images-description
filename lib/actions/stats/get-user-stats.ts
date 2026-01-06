'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { userStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface UserStatsData {
  totalWordsLearned: number;
  totalAnalyses: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

interface GetUserStatsResult {
  success: boolean;
  data?: UserStatsData;
  error?: string;
}

export async function getUserStats(): Promise<GetUserStatsResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id));

  return {
    success: true,
    data: {
      totalWordsLearned: stats?.totalWordsLearned || 0,
      totalAnalyses: stats?.totalAnalyses || 0,
      currentStreak: stats?.currentStreak || 0,
      longestStreak: stats?.longestStreak || 0,
      lastActivityDate: stats?.lastActivityDate || null,
    },
  };
}
