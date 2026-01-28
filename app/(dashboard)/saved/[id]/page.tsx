import { SavedDetailClient } from '@/components/saved/saved-detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedAnalysisPage({ params }: PageProps) {
  const { id } = await params;

  return <SavedDetailClient id={id} />;
}
