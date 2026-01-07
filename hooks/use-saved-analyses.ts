import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { VocabularyItem } from '@/lib/db/schema';

interface SavedAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface SavedAnalysesResponse {
  analyses: SavedAnalysis[];
  page: number;
  limit: number;
}

async function fetchSavedAnalyses(
  page: number,
  limit: number,
  search?: string
): Promise<SavedAnalysesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set('search', search);

  const res = await fetch(`/api/saved?${params}`);
  if (!res.ok) throw new Error('Failed to fetch saved analyses');
  return res.json();
}

async function fetchSavedAnalysis(id: string): Promise<SavedAnalysis> {
  const res = await fetch(`/api/saved/${id}`);
  if (!res.ok) throw new Error('Failed to fetch analysis');
  return res.json();
}

async function deleteSavedAnalysis(id: string): Promise<void> {
  const res = await fetch(`/api/saved/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete analysis');
}

export function useSavedAnalyses(page = 1, limit = 10, search?: string) {
  return useQuery({
    queryKey: queryKeys.savedAnalyses.list(page, limit, search),
    queryFn: () => fetchSavedAnalyses(page, limit, search),
    staleTime: 60 * 1000,
  });
}

export function useSavedAnalysis(id: string) {
  return useQuery({
    queryKey: queryKeys.savedAnalyses.detail(id),
    queryFn: () => fetchSavedAnalysis(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useDeleteSavedAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedAnalysis,
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.savedAnalyses.all });

      // Snapshot previous values for rollback
      const previousLists = queryClient.getQueriesData<SavedAnalysesResponse>({
        queryKey: queryKeys.savedAnalyses.all,
      });

      // Optimistically remove from all list caches
      queryClient.setQueriesData<SavedAnalysesResponse>(
        { queryKey: queryKeys.savedAnalyses.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            analyses: old.analyses.filter((a) => a.id !== deletedId),
          };
        }
      );

      // Remove detail cache
      queryClient.removeQueries({
        queryKey: queryKeys.savedAnalyses.detail(deletedId),
      });

      return { previousLists };
    },
    onError: (_err, _deletedId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.savedAnalyses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: ['recentAnalyses'] });
    },
  });
}
