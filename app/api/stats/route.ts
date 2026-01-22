import { NextResponse } from 'next/server';
import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getDailyUsage } from '@/lib/actions/stats/get-daily-usage';

export async function GET() {
  const [statsResult, usageResult] = await Promise.all([
    getUserStats(),
    getDailyUsage(),
  ]);

  if (!statsResult.success || !usageResult.success) {
    const error = statsResult.error ?? usageResult.error ?? 'Failed to fetch stats';
    return NextResponse.json(
      { error },
      { status: error === 'Not authenticated' ? 401 : 400 }
    );
  }

  return NextResponse.json({
    stats: statsResult.data,
    usage: usageResult.data,
  });
}
