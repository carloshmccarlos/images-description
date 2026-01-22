'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFromR2, getKeyFromUrl } from '@/lib/storage/r2-client';
import * as v from 'valibot';

const inputSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

interface DeleteSavedAnalysisResult {
  success: boolean;
  error?: string;
}

export async function deleteSavedAnalysis(
  input: v.InferInput<typeof inputSchema>
): Promise<DeleteSavedAnalysisResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid analysis ID' };
  }

  const [analysis] = await db
    .select()
    .from(savedAnalyses)
    .where(and(eq(savedAnalyses.id, validated.output.id), eq(savedAnalyses.userId, user.id)));

  if (!analysis) {
    return { success: false, error: 'Analysis not found' };
  }

  const mediaUrls = [
    analysis.imageUrl,
    analysis.descriptionAudioUrl,
    analysis.descriptionNativeAudioUrl,
  ].filter(Boolean) as string[];

  for (const url of mediaUrls) {
    try {
      const key = getKeyFromUrl(url);
      await deleteFromR2(key);
    } catch (error) {
      console.error('Failed to delete media from R2:', error);
    }
  }

  await db.delete(savedAnalyses).where(eq(savedAnalyses.id, analysis.id));

  return { success: true };
}
