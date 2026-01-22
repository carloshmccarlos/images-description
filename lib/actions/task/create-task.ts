'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';
import * as v from 'valibot';

interface CreateTaskResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

const inputSchema = v.object({});

export async function createTask(): Promise<CreateTaskResult> {
  const validated = v.safeParse(inputSchema, {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const [task] = await db
    .insert(analysisTasks)
    .values({
      userId: user.id,
      status: 'pending',
    })
    .returning({ id: analysisTasks.id });

  return {
    success: true,
    data: { id: task.id },
  };
}
