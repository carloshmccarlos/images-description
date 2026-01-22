'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses, userStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { vocabularyItemSchema } from '@/lib/validations/image';
import type { AnalysisSavedItem } from '@/lib/types/analysis';

const inputSchema = v.object({
  imageUrl: v.pipe(v.string(), v.url()),
  description: v.pipe(v.string(), v.minLength(1)),
  vocabulary: v.array(vocabularyItemSchema),
});

interface SaveAnalysisResult {
  success: boolean;
  data?: AnalysisSavedItem;
  error?: string;
}

export async function saveAnalysis(
  input: v.InferInput<typeof inputSchema>
): Promise<SaveAnalysisResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { imageUrl, description, vocabulary } = validated.output;

  const [saved] = await db
    .insert(savedAnalyses)
    .values({
      userId: user.id,
      imageUrl,
      description,
      vocabulary,
    })
    .returning();

  const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id));
  if (stats) {
    await db
      .update(userStats)
      .set({
        totalWordsLearned: stats.totalWordsLearned + vocabulary.length,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, user.id));
  }

  return {
    success: true,
    data: {
      id: saved.id,
      imageUrl: saved.imageUrl,
      description: saved.description,
      vocabulary: saved.vocabulary,
      createdAt: saved.createdAt,
    },
  };
}
