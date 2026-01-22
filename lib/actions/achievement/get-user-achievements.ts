'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { achievements } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import * as v from 'valibot';

interface AchievementData {
  id: string;
  type: string;
  unlockedAt: Date;
}

interface GetUserAchievementsResult {
  success: boolean;
  data?: AchievementData[];
  error?: string;
}

export async function getUserAchievements(): Promise<GetUserAchievementsResult> {
  const validated = v.safeParse(v.object({}), {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const userAchievements = await db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, user.id))
    .orderBy(desc(achievements.unlockedAt));

  return {
    success: true,
    data: userAchievements.map(a => ({
      id: a.id,
      type: a.type,
      unlockedAt: a.unlockedAt,
    })),
  };
}
