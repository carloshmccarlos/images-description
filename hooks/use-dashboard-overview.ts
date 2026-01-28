'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { AnalysisListItem } from '@/lib/types/analysis';

interface DashboardOverview {
  stats: {
    totalWordsLearned: number;
    totalAnalyses: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
  } | null;
  usage: {
    usageCount: number;
    date: string;
    dailyLimit?: number;
  } | null;
  analyses: AnalysisListItem[];
}

async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const response = await fetch('/api/dashboard/overview');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard overview');
  }
  return response.json() as Promise<DashboardOverview>;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboardOverview,
    queryFn: fetchDashboardOverview,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
