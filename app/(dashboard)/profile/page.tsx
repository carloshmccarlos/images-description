import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getRecentActivity } from '@/lib/actions/stats/get-recent-activity';
import { getUserAchievements } from '@/lib/actions/achievement/get-user-achievements';
import { getSavedAnalyses } from '@/lib/actions/analysis/get-saved-analyses';
import { ProfileHeader } from '@/components/profile/profile-header';
import { StatsOverview } from '@/components/profile/stats-overview';
import { AchievementsList } from '@/components/profile/achievements-list';
import { LearningProgress } from '@/components/profile/learning-progress';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

export default async function ProfilePage() {
  const userResult = await getCurrentUser();
  
  if (!userResult.success) {
    if (userResult.needsSetup) redirect('/auth/language-setup');
    redirect('/auth/login');
  }

  const user = userResult.data!;

  const [statsResult, achievementsResult, activityResult, analysesResult] = await Promise.all([
    getUserStats(),
    getUserAchievements(),
    getRecentActivity(7),
    getSavedAnalyses({ page: 1, limit: 1 }),
  ]);

  const stats = statsResult.data;
  const achievements = achievementsResult.data || [];
  const recentActivity = activityResult.data || [];
  const savedAnalysesCount = analysesResult.data?.totalCount || 0;

  const learningLang = SUPPORTED_LANGUAGES.find(l => l.code === user.learningLanguage);
  const nativeLang = SUPPORTED_LANGUAGES.find(l => l.code === user.motherLanguage);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10">
      <ProfileHeader
        name={user.name || user.email.split('@')[0] || 'Learner'}
        email={user.email}
        learningLanguage={learningLang?.name || 'Spanish'}
        learningFlag={learningLang?.flag || '🇪🇸'}
        nativeLanguage={nativeLang?.name || 'English'}
        nativeFlag={nativeLang?.flag || '🇺🇸'}
        proficiencyLevel={user.proficiencyLevel}
        memberSince={user.createdAt}
      />

      <StatsOverview
        totalWords={stats?.totalWordsLearned || 0}
        totalAnalyses={stats?.totalAnalyses || 0}
        currentStreak={stats?.currentStreak || 0}
        longestStreak={stats?.longestStreak || 0}
        savedAnalyses={savedAnalysesCount}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <LearningProgress recentActivity={recentActivity} />
        <AchievementsList achievements={achievements} stats={stats} />
      </div>
    </div>
  );
}
