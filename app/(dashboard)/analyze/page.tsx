import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { getPendingTask } from '@/lib/actions/task/get-pending-task';
import { AnalyzeClient } from './analyze-client';
export default async function AnalyzePage() {
  const [locale, userResult, taskResult] = await Promise.all([
    getLocale(),
    getCurrentUser(),
    getPendingTask(),
  ]);
  
  if (!userResult.success) {
    if (userResult.needsSetup) redirect(`/${locale}/auth/setup`);
    redirect(`/${locale}/auth/login`);
  }

  const hasRunningTask = !!taskResult.data;
  const runningTaskId = taskResult.data?.id ?? null;

  return (
    <AnalyzeClient hasRunningTask={hasRunningTask} runningTaskId={runningTaskId} />
  );
}
