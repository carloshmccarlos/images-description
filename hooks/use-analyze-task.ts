'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { VocabularyItem } from '@/lib/types/analysis';

type TaskStatus = 'pending' | 'analyzing' | 'completed' | 'error';

interface AnalyzeTaskResponse {
  id: string;
  status: TaskStatus;
  vocabulary?: VocabularyItem[] | null;
  savedAnalysisId?: string | null;
  errorMessage?: string | null;
}

interface PendingTaskResponse {
  task: { id: string; status: TaskStatus } | null;
}

interface AnalyzeImageResponse {
  id?: string;
  taskId?: string;
  status?: TaskStatus;
  error?: string;
  vocabulary?: VocabularyItem[] | null;
}

async function fetchPendingTask(): Promise<PendingTaskResponse> {
  const response = await fetch('/api/analyze/pending');
  if (!response.ok) {
    throw new Error('Failed to fetch pending task');
  }
  return response.json() as Promise<PendingTaskResponse>;
}

async function fetchAnalyzeTask(taskId: string): Promise<AnalyzeTaskResponse> {
  const response = await fetch(`/api/analyze/task/${encodeURIComponent(taskId)}`, { cache: 'no-store' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to fetch task' }));
    throw new Error(err.error || 'Failed to fetch task');
  }
  return response.json() as Promise<AnalyzeTaskResponse>;
}

async function analyzeImage(file: File): Promise<AnalyzeImageResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/analyze/image', {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json()) as AnalyzeImageResponse;
  if (!response.ok) {
    const errorMessage = data.error || 'Failed to analyze image';
    const error = new Error(errorMessage);
    (error as Error & { status?: number; data?: AnalyzeImageResponse }).status = response.status;
    (error as Error & { status?: number; data?: AnalyzeImageResponse }).data = data;
    throw error;
  }

  return data;
}

export function usePendingAnalyzeTask() {
  return useQuery({
    queryKey: queryKeys.pendingAnalyzeTask,
    queryFn: fetchPendingTask,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAnalyzeTaskStatus(taskId: string | null) {
  return useQuery({
    queryKey: queryKeys.analyzeTask(taskId ?? 'none'),
    queryFn: () => fetchAnalyzeTask(taskId ?? ''),
    enabled: Boolean(taskId),
    staleTime: Infinity,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1500;
      return data.status === 'pending' || data.status === 'analyzing' ? 1500 : false;
    },
    refetchOnWindowFocus: false,
  });
}

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: analyzeImage,
  });
}
