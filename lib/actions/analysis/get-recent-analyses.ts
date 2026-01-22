'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { AnalysisSummary } from '@/lib/types/analysis';
import * as v from 'valibot';

const inputSchema = v.object({
  limit: v.pipe(v.number(), v.minValue(1), v.maxValue(20)),
});

interface GetRecentAnalysesResult {
  success: boolean;
  data?: AnalysisSummary[];
  error?: string;
}

export async function getRecentAnalyses(
  input: v.InferInput<typeof inputSchema>
): Promise<GetRecentAnalysesResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const analyses = await db
    .select()
    .from(savedAnalyses)
    .where(eq(savedAnalyses.userId, user.id))
    .orderBy(desc(savedAnalyses.createdAt))
    .limit(validated.output.limit);

  return {
    success: true,
    data: analyses.map((a) => ({
      id: a.id,
      imageUrl: a.imageUrl,
      description: a.description,
      vocabulary: a.vocabulary,
      createdAt: a.createdAt,
    })),
  };
}
