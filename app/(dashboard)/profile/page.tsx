import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getRecentActivity } from '@/lib/actions/stats/get-recent-activity';
import { getUserAchievements } from '@/lib/actions/achievement/get-user-achievements';
import { getSavedAnalyses } from '@/lib/actions/analysis/get-saved-analyses';
import { ProfileClient } from '@/components/profile/profile-client';

export default async function ProfilePage() {
  const [statsResult, achievementsResult, activityResult, analysesResult] = await Promise.all([
    getUserStats(),
    getUserAchievements(),
    getRecentActivity({ days: 7 }),
    getSavedAnalyses({ page: 1, limit: 1 }),
  ]);

  const stats = statsResult.data;
  const achievements = achievementsResult.data || [];
  const recentActivity = activityResult.data || [];
  const savedAnalysesCount = analysesResult.data?.totalCount || 0;

  return (
    <ProfileClient
      stats={stats}
      achievements={achievements}
      recentActivity={recentActivity}
      savedAnalysesCount={savedAnalysesCount}
    />
  );
}
