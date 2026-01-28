import { NextResponse } from 'next/server';
import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getUserAchievements } from '@/lib/actions/achievement/get-user-achievements';
import { getRecentActivity } from '@/lib/actions/stats/get-recent-activity';
import { getSavedAnalyses } from '@/lib/actions/analysis/get-saved-analyses';

export async function GET() {
  const [statsResult, achievementsResult, activityResult, analysesResult] = await Promise.all([
    getUserStats(),
    getUserAchievements(),
    getRecentActivity({ days: 7 }),
    getSavedAnalyses({ page: 1, limit: 1 }),
  ]);

  const error =
    statsResult.error ??
    achievementsResult.error ??
    activityResult.error ??
    analysesResult.error;

  if (!statsResult.success || !achievementsResult.success || !activityResult.success || !analysesResult.success) {
    return NextResponse.json(
      { error: error ?? 'Failed to fetch profile data' },
      { status: error === 'Not authenticated' ? 401 : 400 }
    );
  }

  return NextResponse.json({
    stats: statsResult.data,
    achievements: achievementsResult.data ?? [],
    recentActivity: activityResult.data ?? [],
    savedAnalysesCount: analysesResult.data?.totalCount ?? 0,
  });
}
