import type { Metadata } from 'next';
import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getDailyUsage } from '@/lib/actions/stats/get-daily-usage';
import { getRecentAnalyses } from '@/lib/actions/analysis/get-recent-analyses';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your LexiLens dashboard - track your vocabulary learning progress, view recent analyses, and start new image analyses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const [statsResult, usageResult, analysesResult] = await Promise.all([
    getUserStats(),
    getDailyUsage(),
    getRecentAnalyses({ limit: 2 }),
  ]);

  return (
    <DashboardClient
      initialStats={statsResult.data}
      initialUsage={usageResult.data}
      initialAnalyses={analysesResult.data || []}
    />
  );
}
