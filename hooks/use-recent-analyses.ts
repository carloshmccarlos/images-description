import { useQuery } from '@tanstack/react-query';
import type { VocabularyItem } from '@/lib/db/schema';

interface RecentAnalysis {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface RecentAnalysesResponse {
  analyses: RecentAnalysis[];
}

async function fetchRecentAnalyses(limit: number): Promise<RecentAnalysesResponse> {
  const response = await fetch(`/api/analyses/recent?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch recent analyses');
  return response.json();
}

export function useRecentAnalyses(limit = 2) {
  return useQuery({
    queryKey: ['recentAnalyses', limit],
    queryFn: () => fetchRecentAnalyses(limit),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}
