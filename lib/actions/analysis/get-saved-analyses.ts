'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { AnalysisListItem } from '@/lib/types/analysis';
import * as v from 'valibot';

const inputSchema = v.object({
  page: v.pipe(v.number(), v.minValue(1), v.maxValue(1000)),
  limit: v.pipe(v.number(), v.minValue(1), v.maxValue(50)),
  searchQuery: v.optional(v.string()),
});

interface GetSavedAnalysesResult {
  success: boolean;
  data?: {
    analyses: AnalysisListItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

export async function getSavedAnalyses(
  input: v.InferInput<typeof inputSchema>
): Promise<GetSavedAnalysesResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { page, limit, searchQuery } = validated.output;
  const offset = (page - 1) * limit;

  let analyses: AnalysisListItem[];
  let totalCount: number;

  if (searchQuery?.trim()) {
    const searchPattern = `%${searchQuery.trim()}%`;
    
    analyses = await db
      .select({
        id: savedAnalyses.id,
        imageUrl: savedAnalyses.imageUrl,
        description: savedAnalyses.description,
        createdAt: savedAnalyses.createdAt,
        vocabularyCount: sql<number>`jsonb_array_length(${savedAnalyses.vocabulary})`,
      })
      .from(savedAnalyses)
      .where(
        sql`${savedAnalyses.userId} = ${user.id} AND (
          ${savedAnalyses.description} ILIKE ${searchPattern} OR
          ${savedAnalyses.vocabulary}::text ILIKE ${searchPattern}
        )`
      )
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(savedAnalyses)
      .where(
        sql`${savedAnalyses.userId} = ${user.id} AND (
          ${savedAnalyses.description} ILIKE ${searchPattern} OR
          ${savedAnalyses.vocabulary}::text ILIKE ${searchPattern}
        )`
      );
    totalCount = Number(countResult?.count || 0);
  } else {
    analyses = await db
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
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, user.id));
    totalCount = Number(countResult?.count || 0);
  }

  return {
    success: true,
    data: {
      analyses,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    },
  };
}
