import { useQuery } from '@tanstack/react-query';

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
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
