'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, FileText, TrendingUp, BookOpen } from 'lucide-react';
import { MetricCard } from '@/components/admin/metric-card';
import { TimeSeriesChart } from '@/components/admin/time-series-chart';

interface PlatformStats {
  totalUsers: number;
  totalAnalyses: number;
  dailyActiveUsers: number;
  totalWordsLearned: number;
  userGrowth: Array<{ date: string; count: number }>;
  analysisGrowth: Array<{ date: string; count: number }>;
}

export default function AdminOverviewPage() {
  const t = useTranslations('admin');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();

        if (!result.success) {
          setError(result.error);
          return;
        }

        setStats(result.data);
      } catch {
        setError(t('toast.fetchError'));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [t]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Playfair_Display'] mb-2">
            {t('overview.title')}
          </h1>
          <p className="text-zinc-400">{t('toast.fetchError')}...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#141416] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Playfair_Display'] mb-2">
            {t('overview.title')}
          </h1>
          <p className="text-rose-400">{t('toast.error')}: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-white font-['Playfair_Display'] mb-2">
          {t('overview.title')}
        </h1>
        <p className="text-zinc-400">
          {t('overview.subtitle')}
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('overview.totalUsers')}
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          change={12}
          changeLabel={t('overview.last30Days')}
        />
        <MetricCard
          title={t('overview.totalAnalyses')}
          value={stats.totalAnalyses}
          icon={FileText}
          trend="up"
          change={8}
          changeLabel={t('overview.last30Days')}
        />
        <MetricCard
          title={t('overview.dailyActiveUsers')}
          value={stats.dailyActiveUsers}
          icon={TrendingUp}
          trend="neutral"
        />
        <MetricCard
          title={t('overview.wordsLearned')}
          value={stats.totalWordsLearned}
          icon={BookOpen}
          trend="up"
          change={15}
          changeLabel={t('overview.last30Days')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={stats.userGrowth}
          title={t('overview.userGrowth')}
          color="#8b5cf6"
        />
        <TimeSeriesChart
          data={stats.analysisGrowth}
          title={t('overview.analysisGrowth')}
          color="#f43f5e"
        />
      </div>
    </div>
  );
}