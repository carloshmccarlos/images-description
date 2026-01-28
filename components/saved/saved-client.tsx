'use client';

import { useSavedAnalyses } from '@/hooks/use-saved-analyses';
import { SavedAnalysesList } from '@/components/saved/saved-analyses-list';
import { SavedHeader } from '@/components/saved/saved-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SavedClientProps {
  page: number;
  searchQuery?: string;
}

export function SavedClient({ page, searchQuery }: SavedClientProps) {
  const { data, isLoading } = useSavedAnalyses(page, 12, searchQuery);

  if (isLoading && !data) {
    return (
      <div className="max-w-screen-2xl mx-auto space-y-10">
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const analyses = data?.analyses ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const totalWords = analyses.reduce((sum, a) => sum + a.vocabularyCount, 0);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10">
      <SavedHeader 
        totalAnalyses={totalCount} 
        totalWords={totalWords}
        searchQuery={searchQuery}
      />
      <SavedAnalysesList 
        analyses={analyses} 
        currentPage={page}
        totalPages={totalPages}
        searchQuery={searchQuery}
      />
    </div>
  );
}
