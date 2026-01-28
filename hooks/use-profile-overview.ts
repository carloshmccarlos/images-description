'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { DailyUsageSummary } from '@/lib/types/stats';

interface ProfileOverview {
  stats: {
    totalWordsLearned: number;
    totalAnalyses: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
  } | null;
  achievements: Array<{
    id: string;
    type: string;
    unlockedAt: string;
  }>;
  recentActivity: DailyUsageSummary[];
  savedAnalysesCount: number;
}

async function fetchProfileOverview(): Promise<ProfileOverview> {
  const response = await fetch('/api/profile/overview');
  if (!response.ok) {
    throw new Error('Failed to fetch profile overview');
  }
  return response.json() as Promise<ProfileOverview>;
}

export function useProfileOverview() {
  return useQuery({
    queryKey: queryKeys.profileOverview,
    queryFn: fetchProfileOverview,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
