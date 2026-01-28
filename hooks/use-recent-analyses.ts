import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { AnalysisListItem } from '@/lib/types/analysis';

interface RecentAnalysesResponse {
  analyses: AnalysisListItem[];
}

async function fetchRecentAnalyses(limit: number): Promise<RecentAnalysesResponse> {
  const response = await fetch(`/api/analyses/recent?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch recent analyses');
  return response.json();
}

export function useRecentAnalyses(limit = 2) {
  return useQuery({
    queryKey: queryKeys.recentAnalyses(limit),
    queryFn: () => fetchRecentAnalyses(limit),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
