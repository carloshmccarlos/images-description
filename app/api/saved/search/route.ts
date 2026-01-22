import { NextResponse } from 'next/server';
import { getSavedAnalyses } from '@/lib/actions/analysis/get-saved-analyses';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const pageRaw = parseInt(searchParams.get('page') || '1');
    const limitRaw = parseInt(searchParams.get('limit') || '10');
    const page = Number.isFinite(pageRaw) ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) ? limitRaw : 10;
    const searchQuery = query.trim();

    if (!searchQuery) {
      return NextResponse.json({ analyses: [], page, limit, query });
    }

    const result = await getSavedAnalyses({ page, limit, searchQuery });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to search analyses' },
        { status: result.error === 'Not authenticated' ? 401 : 400 }
      );
    }

    return NextResponse.json({
      analyses: result.data?.analyses ?? [],
      page: result.data?.currentPage ?? page,
      limit,
      query,
    });
  } catch (error) {
    console.error('Error searching analyses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
