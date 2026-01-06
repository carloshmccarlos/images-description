'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';

interface CreateTaskResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

export async function createTask(): Promise<CreateTaskResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
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
