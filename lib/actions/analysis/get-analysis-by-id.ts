'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { AnalysisDetail } from '@/lib/types/analysis';
import * as v from 'valibot';

const inputSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

interface GetAnalysisByIdResult {
  success: boolean;
  data?: AnalysisDetail;
  error?: string;
}

export async function getAnalysisById(
  input: v.InferInput<typeof inputSchema>
): Promise<GetAnalysisByIdResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) return { success: false, error: 'Invalid analysis ID' };

  const [analysis] = await db
    .select()
    .from(savedAnalyses)
    .where(and(
      eq(savedAnalyses.id, validated.output.id),
      eq(savedAnalyses.userId, user.id)
    ));

  if (!analysis) {
    return { success: false, error: 'Analysis not found' };
  }

  return {
    success: true,
    data: {
      id: analysis.id,
      imageUrl: analysis.imageUrl,
      description: analysis.description,
      descriptionNative: analysis.descriptionNative ?? null,
      learningLanguage: analysis.learningLanguage ?? null,
      motherLanguage: analysis.motherLanguage ?? null,
      descriptionAudioUrl: analysis.descriptionAudioUrl ?? null,
      descriptionNativeAudioUrl: analysis.descriptionNativeAudioUrl ?? null,
      vocabulary: analysis.vocabulary,
      createdAt: analysis.createdAt,
    },
  };
}
