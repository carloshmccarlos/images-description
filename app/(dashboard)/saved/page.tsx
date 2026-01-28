import { SavedClient } from '@/components/saved/saved-client';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SavedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageRaw = parseInt(params.page || '1');
  const page = Number.isFinite(pageRaw) ? pageRaw : 1;
  const searchQuery = params.q?.trim();

  return <SavedClient page={page} searchQuery={searchQuery} />;
}
