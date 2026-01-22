'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import * as v from 'valibot';

const STALE_TASK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const inputSchema = v.object({});

interface GetPendingTaskResult {
  success: boolean;
  data?: { id: string; status: string } | null;
  error?: string;
}

export async function getPendingTask(): Promise<GetPendingTaskResult> {
  const validated = v.safeParse(inputSchema, {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get the most recent active task
  const [task] = await db
    .select()
    .from(analysisTasks)
    .where(and(
      eq(analysisTasks.userId, user.id),
      inArray(analysisTasks.status, ['pending', 'analyzing'])
    ))
    .orderBy(desc(analysisTasks.createdAt))
    .limit(1);

  if (!task) {
    return { success: true, data: null };
  }

  // Check if task is stale (older than 10 minutes)
  const taskAge = Date.now() - new Date(task.createdAt).getTime();
  if (taskAge > STALE_TASK_TIMEOUT_MS) {
    // Delete stale task to avoid user being stuck
    await db.delete(analysisTasks).where(eq(analysisTasks.id, task.id));
    return { success: true, data: null };
  }

  return {
    success: true,
    data: {
      id: task.id,
      status: task.status,
    },
  };
}
