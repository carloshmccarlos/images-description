'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { VocabularyItem } from '@/lib/db/schema';

const inputSchema = z.object({
  id: z.string().uuid(),
});

interface AnalysisDetail {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface GetAnalysisByIdResult {
  success: boolean;
  data?: AnalysisDetail;
  error?: string;
}

export async function getAnalysisById(
  input: z.infer<typeof inputSchema>
): Promise<GetAnalysisByIdResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = inputSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid analysis ID' };
  }

  const [analysis] = await db
    .select()
    .from(savedAnalyses)
    .where(and(
      eq(savedAnalyses.id, validated.data.id),
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
      vocabulary: analysis.vocabulary,
      createdAt: analysis.createdAt,
    },
  };
}
