import { NextResponse } from 'next/server';
import { getPendingTask } from '@/lib/actions/task/get-pending-task';

export async function GET() {
  const result = await getPendingTask();

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to fetch pending task' },
      { status: result.error === 'Not authenticated' ? 401 : 400 }
    );
  }

  return NextResponse.json({ task: result.data });
}
