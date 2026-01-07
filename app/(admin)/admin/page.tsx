'use client';

import { useEffect, useState } from 'react';
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
      } catch (err) {
        setError('Failed to load platform statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Playfair_Display'] mb-2">
            Platform Overview
          </h1>
          <p className="text-zinc-400">Loading platform statistics...</p>
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
            Platform Overview
          </h1>
          <p className="text-rose-400">Error: {error}</p>
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
          Platform Overview
        </h1>
        <p className="text-zinc-400">
          Monitor key metrics and platform performance
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          change={12}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Total Analyses"
          value={stats.totalAnalyses}
          icon={FileText}
          trend="up"
          change={8}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Daily Active Users"
          value={stats.dailyActiveUsers}
          icon={TrendingUp}
          trend="neutral"
        />
        <MetricCard
          title="Words Learned"
          value={stats.totalWordsLearned}
          icon={BookOpen}
          trend="up"
          change={15}
          changeLabel="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={stats.userGrowth}
          title="User Registrations"
          color="#8b5cf6"
        />
        <TimeSeriesChart
          data={stats.analysisGrowth}
          title="Image Analyses"
          color="#f43f5e"
        />
      </div>
    </div>
  );
}