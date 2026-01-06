import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { getUserStats } from '@/lib/actions/stats/get-user-stats';
import { getDailyUsage } from '@/lib/actions/stats/get-daily-usage';
import { getRecentAnalyses } from '@/lib/actions/analysis/get-recent-analyses';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your LexiLens dashboard - track your vocabulary learning progress, view recent analyses, and start new image analyses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const userResult = await getCurrentUser();
  
  if (!userResult.success) {
    if (userResult.needsSetup) redirect('/auth/language-setup');
    redirect('/auth/login');
  }

  const user = userResult.data!;

  const [statsResult, usageResult, analysesResult] = await Promise.all([
    getUserStats(),
    getDailyUsage(),
    getRecentAnalyses({ limit: 2 }),
  ]);

  const learningLang = SUPPORTED_LANGUAGES.find(l => l.code === user.learningLanguage);
  const nativeLang = SUPPORTED_LANGUAGES.find(l => l.code === user.motherLanguage);

  return (
    <DashboardClient
      userName={user.name || user.email.split('@')[0] || 'Learner'}
      learningLanguage={learningLang?.name || 'Spanish'}
      learningFlag={learningLang?.flag || '🇪🇸'}
      nativeLanguage={nativeLang?.name || 'English'}
      nativeFlag={nativeLang?.flag || '🇺🇸'}
      initialStats={statsResult.data}
      initialUsage={usageResult.data}
      initialAnalyses={analysesResult.data || []}
    />
  );
}
