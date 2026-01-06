import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { getPendingTask } from '@/lib/actions/task/get-pending-task';
import { AnalyzeClient } from './analyze-client';

export default async function AnalyzePage() {
  const userResult = await getCurrentUser();
  
  if (!userResult.success) {
    if (userResult.needsSetup) redirect('/auth/language-setup');
    redirect('/auth/login');
  }

  const taskResult = await getPendingTask();
  const hasRunningTask = !!taskResult.data;

  return (
    <AnalyzeClient hasRunningTask={hasRunningTask} />
  );
}
