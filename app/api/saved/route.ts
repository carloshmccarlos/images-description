import { NextResponse } from 'next/server';
import { getSavedAnalyses } from '@/lib/actions/analysis/get-saved-analyses';
import { saveAnalysis } from '@/lib/actions/analysis/save-analysis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageRaw = parseInt(searchParams.get('page') || '1');
    const limitRaw = parseInt(searchParams.get('limit') || '10');
    const page = Number.isFinite(pageRaw) ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) ? limitRaw : 10;
    const search = searchParams.get('search') || undefined;

    const result = await getSavedAnalyses({ page, limit, searchQuery: search });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to fetch saved analyses' },
        { status: result.error === 'Not authenticated' ? 401 : 400 }
      );
    }

    return NextResponse.json({
      analyses: result.data?.analyses ?? [],
      page: result.data?.currentPage ?? page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching saved analyses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await saveAnalysis(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Invalid data' },
        { status: result.error === 'Not authenticated' ? 401 : 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
