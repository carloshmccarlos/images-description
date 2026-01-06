import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { getSavedAnalyses } from '@/lib/actions/analysis/get-saved-analyses';
import { SavedAnalysesList } from '@/components/saved/saved-analyses-list';
import { SavedHeader } from '@/components/saved/saved-header';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SavedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const userResult = await getCurrentUser();
  
  if (!userResult.success) {
    redirect('/auth/login');
  }

  const page = parseInt(params.page || '1');
  const searchQuery = params.q?.trim();

  const analysesResult = await getSavedAnalyses({
    page,
    limit: 12,
    searchQuery,
  });

  const analyses = analysesResult.data?.analyses || [];
  const totalCount = analysesResult.data?.totalCount || 0;
  const totalPages = analysesResult.data?.totalPages || 1;
  const totalWords = analyses.reduce((sum, a) => sum + a.vocabulary.length, 0);

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
