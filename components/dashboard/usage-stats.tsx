'use client';

import { motion } from 'framer-motion';
import { Camera, BookOpen, Flame, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface UsageStatsProps {
  used: number;
  limit: number;
  totalWords: number;
  currentStreak: number;
  totalAnalyses: number;
}

export function UsageStats({ used, limit, totalWords, currentStreak, totalAnalyses }: UsageStatsProps) {
  const t = useTranslations('dashboard');
  const remaining = limit - used;
  const usagePercent = (used / limit) * 100;

  const stats = [
    {
      label: t('stats.dailyAnalyses'),
      value: `${remaining}/${limit}`,
      icon: Camera,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: t('stats.wordsLearned'),
      value: totalWords.toString(),
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: t('stats.dayStreak'),
      value: currentStreak.toString(),
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: t('stats.totalAnalyses'),
      value: totalAnalyses.toString(),
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
              <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
              <CardContent className="p-5 relative z-10">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t('stats.dailyUsage')}</span>
            <span className="text-sm text-zinc-500">
              {used} {t('stats.usedOfLimit')} {limit}
            </span>
          </div>
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                usagePercent >= 100
                  ? 'bg-red-500'
                  : usagePercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-linear-to-r from-sky-500 to-emerald-500'
              }`}
            />
          </div>
          {usagePercent >= 100 && (
            <p className="text-sm text-red-500 mt-2 font-medium">{t('stats.dailyLimitReached')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
