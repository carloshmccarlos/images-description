'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { VocabularyItem } from '@/lib/db/schema';

const inputSchema = z.object({
  limit: z.number().min(1).max(20).default(4),
});

interface RecentAnalysis {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface GetRecentAnalysesResult {
  success: boolean;
  data?: RecentAnalysis[];
  error?: string;
}

export async function getRecentAnalyses(
  input: z.infer<typeof inputSchema> = { limit: 4 }
): Promise<GetRecentAnalysesResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = inputSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input parameters' };
  }

  const analyses = await db
    .select()
    .from(savedAnalyses)
    .where(eq(savedAnalyses.userId, user.id))
    .orderBy(desc(savedAnalyses.createdAt))
    .limit(validated.data.limit);

  return {
    success: true,
    data: analyses.map(a => ({
      id: a.id,
      imageUrl: a.imageUrl,
      description: a.description,
      vocabulary: a.vocabulary,
      createdAt: a.createdAt,
    })),
  };
}
