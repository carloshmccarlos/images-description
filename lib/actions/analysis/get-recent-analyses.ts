'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { AnalysisListItem } from '@/lib/types/analysis';
import * as v from 'valibot';

const inputSchema = v.object({
  limit: v.pipe(v.number(), v.minValue(1), v.maxValue(20)),
});

interface GetRecentAnalysesResult {
  success: boolean;
  data?: AnalysisListItem[];
  error?: string;
}

export async function getRecentAnalyses(
  input: v.InferInput<typeof inputSchema>
): Promise<GetRecentAnalysesResult> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const analyses = await db
    .select({
      id: savedAnalyses.id,
      imageUrl: savedAnalyses.imageUrl,
      description: savedAnalyses.description,
      createdAt: savedAnalyses.createdAt,
      vocabularyCount: sql<number>`jsonb_array_length(${savedAnalyses.vocabulary})`,
    })
    .from(savedAnalyses)
    .where(eq(savedAnalyses.userId, user.id))
    .orderBy(desc(savedAnalyses.createdAt))
    .limit(validated.output.limit);

  return {
    success: true,
    data: analyses,
  };
}
