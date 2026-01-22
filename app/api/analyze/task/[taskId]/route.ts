import { NextResponse } from 'next/server';
import { getTaskById } from '@/lib/actions/task/get-task-by-id';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const result = await getTaskById({ taskId });

    if (!result.success) {
      const status =
        result.error === 'Not authenticated' ? 401
          : result.error === 'Invalid task ID' ? 400
            : 404;
      return NextResponse.json(
        { error: result.error ?? 'Failed to fetch task' },
        { status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
