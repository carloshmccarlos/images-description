import { NextResponse } from 'next/server';
import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getDailyUsage } from '@/lib/actions/stats/get-daily-usage';

export async function GET() {
  const [statsResult, usageResult] = await Promise.all([
    getUserStats(),
    getDailyUsage(),
  ]);

  if (!statsResult.success) {
    return NextResponse.json({ error: statsResult.error }, { status: 401 });
  }

  return NextResponse.json({
    stats: statsResult.data,
    usage: usageResult.data,
  });
}
