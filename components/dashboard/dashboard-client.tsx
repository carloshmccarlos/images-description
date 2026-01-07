'use client';

import { useStats } from '@/hooks/use-stats';
import { useRecentAnalyses } from '@/hooks/use-recent-analyses';
import { UsageStats } from './usage-stats';
import { RecentAnalyses } from './recent-analyses';
import { QuickActions } from './quick-actions';
import { WelcomeCard } from './welcome-card';
import { DAILY_FREE_LIMIT } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardClientProps {
  userName: string;
  learningLanguage: string;
  learningFlag: string;
  nativeLanguage: string;
  nativeFlag: string;
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
    vocabulary: Array<{
      word: string;
      translation: string;
      pronunciation: string;
      exampleSentence: string;
      category?: string;
    }>;
    createdAt: Date;
  }>;
}

export function DashboardClient({
  userName,
  learningLanguage,
  learningFlag,
  nativeLanguage,
  nativeFlag,
  initialStats,
  initialUsage,
  initialAnalyses = [],
}: DashboardClientProps) {
  const { data: statsData, isLoading: isStatsLoading } = useStats();
  const { data: analysesData, isLoading: isAnalysesLoading } = useRecentAnalyses(2);

  const stats = statsData?.stats ?? initialStats;
  const usage = statsData?.usage ?? initialUsage;
  const analyses = analysesData?.analyses ?? initialAnalyses;

  const usageCount = usage?.usageCount ?? 0;
  const dailyLimit = usage?.dailyLimit ?? DAILY_FREE_LIMIT;
  const remainingAnalyses = dailyLimit - usageCount;

  return (
    <div className="space-y-10 max-w-screen-2xl mx-auto">
      <WelcomeCard 
        userName={userName}
        learningLanguage={learningLanguage}
        learningFlag={learningFlag}
        nativeLanguage={nativeLanguage}
        nativeFlag={nativeFlag}
        remainingAnalyses={remainingAnalyses}
      />

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
