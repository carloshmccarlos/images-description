import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface UserStats {
  totalWordsLearned: number;
  totalAnalyses: number;
  currentStreak: number;
  longestStreak: number;
}

interface DailyUsage {
  usageCount: number;
  date: string;
  dailyLimit?: number;
}

interface StatsResponse {
  stats: UserStats | null;
  usage: DailyUsage | null;
}

async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
