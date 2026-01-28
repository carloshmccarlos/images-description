'use client';

import { useStats } from '@/hooks/use-stats';
import { useRecentAnalyses } from '@/hooks/use-recent-analyses';
import { UsageStats } from './usage-stats';
import { RecentAnalyses } from './recent-analyses';
import { QuickActions } from './quick-actions';
import { WelcomeCard } from './welcome-card';
import { DAILY_FREE_LIMIT, SUPPORTED_LANGUAGES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/hooks/use-session';

interface DashboardClientProps {
  // Initial data for SSR
  initialStats?: {
    totalWordsLearned: number;
    totalAnalyses: number;
    currentStreak: number;
    longestStreak: number;
  } | null;
  initialUsage?: {
    usageCount: number;
    dailyLimit?: number;
  } | null;
  initialAnalyses?: Array<{
    id: string;
    imageUrl: string;
    description: string;
    vocabularyCount: number;
    createdAt: Date;
  }>;
}

export function DashboardClient({
  initialStats,
  initialUsage,
  initialAnalyses = [],
}: DashboardClientProps) {
  const { data: sessionData, isLoading: isSessionLoading } = useSession();
  const { data: statsData, isLoading: isStatsLoading } = useStats();
  const { data: analysesData, isLoading: isAnalysesLoading } = useRecentAnalyses(2);

  const user = sessionData?.user ?? null;
  const fallbackLearning = SUPPORTED_LANGUAGES.find((l) => l.code === 'en') ?? SUPPORTED_LANGUAGES[0];
  const fallbackNative = SUPPORTED_LANGUAGES.find((l) => l.code === 'zh-cn') ?? fallbackLearning;
  const learningLang = SUPPORTED_LANGUAGES.find((l) => l.code === (user?.learningLanguage ?? 'en')) ?? fallbackLearning;
  const nativeLang = SUPPORTED_LANGUAGES.find((l) => l.code === (user?.motherLanguage ?? 'zh-cn')) ?? fallbackNative;

  const userName = user?.name || user?.email?.split('@')[0] || 'Learner';

  const stats = statsData?.stats ?? initialStats;
  const usage = statsData?.usage ?? initialUsage;
  const analyses = analysesData?.analyses ?? initialAnalyses;

  const usageCount = usage?.usageCount ?? 0;
  const dailyLimit = usage?.dailyLimit ?? DAILY_FREE_LIMIT;
  const remainingAnalyses = dailyLimit - usageCount;

  return (
    <div className="space-y-10 max-w-screen-2xl mx-auto">
      {isSessionLoading && !user ? (
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </CardContent>
        </Card>
      ) : (
        <WelcomeCard 
          userName={userName}
          learningLanguage={learningLang?.name ?? ''}
          learningFlag={learningLang?.flag ?? ''}
          nativeLanguage={nativeLang?.name ?? ''}
          nativeFlag={nativeLang?.flag ?? ''}
          remainingAnalyses={remainingAnalyses}
        />
      )}

      {isStatsLoading && !initialStats ? (
        <StatsLoadingSkeleton />
      ) : (
        <UsageStats
          used={usageCount}
          limit={dailyLimit}
          totalWords={stats?.totalWordsLearned ?? 0}
          currentStreak={stats?.currentStreak ?? 0}
          totalAnalyses={stats?.totalAnalyses ?? 0}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 h-full">
          {isAnalysesLoading && initialAnalyses.length === 0 ? (
            <AnalysesLoadingSkeleton />
          ) : (
            <RecentAnalyses analyses={analyses} />
          )}
        </div>
        <div className="h-full">
          <QuickActions canAnalyze={usageCount < dailyLimit} />
        </div>
      </div>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysesLoadingSkeleton() {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 h-full">
      <CardContent className="p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid sm:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
