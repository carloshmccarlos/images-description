import { NextResponse } from 'next/server';
import { getRecentAnalyses } from '@/lib/actions/analysis/get-recent-analyses';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '2');

  const result = await getRecentAnalyses({ limit });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ analyses: result.data });
}
