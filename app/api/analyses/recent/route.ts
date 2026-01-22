import { NextResponse } from 'next/server';
import { getRecentAnalyses } from '@/lib/actions/analysis/get-recent-analyses';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = parseInt(searchParams.get('limit') || '2');
  const limit = Number.isFinite(limitRaw) ? limitRaw : 2;

  const result = await getRecentAnalyses({ limit });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to fetch recent analyses' },
      { status: result.error === 'Not authenticated' ? 401 : 400 }
    );
  }

  return NextResponse.json({ analyses: result.data });
}
