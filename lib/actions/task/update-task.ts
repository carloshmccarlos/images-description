'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { VocabularyItem } from '@/lib/db/schema';

const updateTaskSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['pending', 'uploading', 'analyzing', 'completed', 'failed']).optional(),
  progress: z.number().min(0).max(100).optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  vocabulary: z.array(z.object({
    word: z.string(),
    translation: z.string(),
    pronunciation: z.string(),
    exampleSentence: z.string(),
    category: z.string().optional(),
  })).optional(),
  errorMessage: z.string().optional(),
  savedAnalysisId: z.string().uuid().optional(),
});

interface UpdateTaskResult {
  success: boolean;
  error?: string;
}

export async function updateTask(
  input: z.infer<typeof updateTaskSchema>
): Promise<UpdateTaskResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = updateTaskSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { taskId, ...updates } = validated.data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.vocabulary !== undefined) updateData.vocabulary = updates.vocabulary as VocabularyItem[];
  if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;
  if (updates.savedAnalysisId !== undefined) updateData.savedAnalysisId = updates.savedAnalysisId;

  await db
    .update(analysisTasks)
    .set(updateData)
    .where(and(
      eq(analysisTasks.id, taskId),
      eq(analysisTasks.userId, user.id)
    ));

  return { success: true };
}
