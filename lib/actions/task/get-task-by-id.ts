'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import * as v from 'valibot';
import type { AnalysisTaskDetail } from '@/lib/types/analysis';

const inputSchema = v.object({
  taskId: v.pipe(v.string(), v.uuid()),
});

interface GetTaskByIdResult {
  success: boolean;
  data?: AnalysisTaskDetail;
  error?: string;
}

export async function getTaskById(
  input: v.InferInput<typeof inputSchema>
): Promise<GetTaskByIdResult> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(inputSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid task ID' };
  }

  const [task] = await db
    .select()
    .from(analysisTasks)
    .where(and(
      eq(analysisTasks.id, validated.output.taskId),
      eq(analysisTasks.userId, user.id)
    ));

  if (!task) {
    return { success: false, error: 'Task not found' };
  }

  return {
    success: true,
    data: {
      id: task.id,
      status: task.status,
      imageUrl: task.imageUrl ?? null,
      description: task.description ?? null,
      vocabulary: task.vocabulary ?? null,
      savedAnalysisId: task.savedAnalysisId ?? null,
      errorMessage: task.errorMessage ?? null,
    },
  };
}
