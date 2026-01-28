import { getPendingTask } from '@/lib/actions/task/get-pending-task';
import { AnalyzeClient } from './analyze-client';

export default async function AnalyzePage() {
  const taskResult = await getPendingTask();
  const hasRunningTask = Boolean(taskResult.data);
  const runningTaskId = taskResult.data?.id ?? null;

  return (
    <AnalyzeClient hasRunningTask={hasRunningTask} runningTaskId={runningTaskId} />
  );
}
