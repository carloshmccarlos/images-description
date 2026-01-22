'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { VocabularyItem } from '@/lib/types/analysis';
import { vocabularyItemSchema } from '@/lib/validations/image';
import * as v from 'valibot';

const updateTaskSchema = v.object({
  taskId: v.pipe(v.string(), v.uuid()),
  status: v.optional(v.picklist(['pending', 'uploading', 'analyzing', 'completed', 'error', 'failed'])),
  progress: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
  imageUrl: v.optional(v.string()),
  description: v.optional(v.string()),
  vocabulary: v.optional(v.array(vocabularyItemSchema)),
  errorMessage: v.optional(v.string()),
  savedAnalysisId: v.optional(v.pipe(v.string(), v.uuid())),
});

interface UpdateTaskResult {
  success: boolean;
  error?: string;
}

export async function updateTask(
  input: v.InferInput<typeof updateTaskSchema>
): Promise<UpdateTaskResult> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(updateTaskSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { taskId, ...updates } = validated.output;

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
