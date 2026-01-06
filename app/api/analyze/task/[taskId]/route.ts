import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { analysisTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [task] = await db
      .select()
      .from(analysisTasks)
      .where(and(
        eq(analysisTasks.id, taskId),
        eq(analysisTasks.userId, user.id)
      ));

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: task.id,
      status: task.status,
      imageUrl: task.imageUrl,
      description: task.description,
      vocabulary: task.vocabulary,
      savedAnalysisId: task.savedAnalysisId,
      errorMessage: task.errorMessage,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
