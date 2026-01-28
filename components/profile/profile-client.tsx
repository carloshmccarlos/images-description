'use client';

import { ProfileHeader } from '@/components/profile/profile-header';
import { StatsOverview } from '@/components/profile/stats-overview';
import { AchievementsList } from '@/components/profile/achievements-list';
import { LearningProgress } from '@/components/profile/learning-progress';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { useSession } from '@/hooks/use-session';
import type { DailyUsageSummary } from '@/lib/types/stats';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface UserStatsData {
  totalWordsLearned: number;
  totalAnalyses: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

interface AchievementData {
  id: string;
  type: string;
  unlockedAt: string | Date;
}

interface ProfileClientProps {
  stats: UserStatsData | null | undefined;
  achievements: AchievementData[];
  recentActivity: DailyUsageSummary[];
  savedAnalysesCount: number;
}

export function ProfileClient({
  stats,
  achievements,
  recentActivity,
  savedAnalysesCount,
}: ProfileClientProps) {
  const { data: sessionData, isLoading } = useSession();
  const user = sessionData?.user ?? null;

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto space-y-10">
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-72" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  const fallbackLearning = SUPPORTED_LANGUAGES.find((l) => l.code === 'en') ?? SUPPORTED_LANGUAGES[0];
  const fallbackNative = SUPPORTED_LANGUAGES.find((l) => l.code === 'zh-cn') ?? fallbackLearning;
  const learningLang = SUPPORTED_LANGUAGES.find((l) => l.code === (user.learningLanguage ?? 'en')) ?? fallbackLearning;
  const nativeLang = SUPPORTED_LANGUAGES.find((l) => l.code === (user.motherLanguage ?? 'zh-cn')) ?? fallbackNative;
  const memberSince = user.createdAt ? new Date(user.createdAt) : new Date();

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10">
      <ProfileHeader
        name={user.name || user.email.split('@')[0] || 'Learner'}
        email={user.email}
        learningLanguage={learningLang?.name ?? ''}
        learningFlag={learningLang?.flag ?? ''}
        nativeLanguage={nativeLang?.name ?? ''}
        nativeFlag={nativeLang?.flag ?? ''}
        proficiencyLevel={user.proficiencyLevel}
        memberSince={memberSince}
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
        <AchievementsList achievements={achievements} stats={stats ?? undefined} />
      </div>
    </div>
  );
}
