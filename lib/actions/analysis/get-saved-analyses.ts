'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { VocabularyItem } from '@/lib/db/schema';

const inputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  searchQuery: z.string().optional(),
});

interface AnalysisItem {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface GetSavedAnalysesResult {
  success: boolean;
  data?: {
    analyses: AnalysisItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

export async function getSavedAnalyses(
  input: z.infer<typeof inputSchema> = { page: 1, limit: 12 }
): Promise<GetSavedAnalysesResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = inputSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const { page, limit, searchQuery } = validated.data;
  const offset = (page - 1) * limit;

  let analyses: AnalysisItem[];
  let totalCount: number;

  if (searchQuery?.trim()) {
    const searchPattern = `%${searchQuery.trim()}%`;
    
    analyses = await db
      .select()
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
      .select()
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
      analyses: analyses.map(a => ({
        id: a.id,
        imageUrl: a.imageUrl,
        description: a.description,
        vocabulary: a.vocabulary,
        createdAt: a.createdAt,
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    },
  };
}
