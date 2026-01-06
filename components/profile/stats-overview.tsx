'use client';

import { motion } from 'framer-motion';
import { BookOpen, Camera, Flame, Trophy, BookMarked } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface StatsOverviewProps {
  totalWords: number;
  totalAnalyses: number;
  currentStreak: number;
  longestStreak: number;
  savedAnalyses: number;
}

export function StatsOverview({
  totalWords,
  totalAnalyses,
  currentStreak,
  longestStreak,
  savedAnalyses,
}: StatsOverviewProps) {
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');

  const stats = [
    {
      label: t('stats.wordsLearned'),
      value: totalWords,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: t('stats.totalAnalyses'),
      value: totalAnalyses,
      icon: Camera,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: t('stats.currentStreak'),
      value: `${currentStreak} ${tCommon('common.days')}`,
      icon: Flame,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: t('stats.longestStreak'),
      value: `${longestStreak} ${tCommon('common.days')}`,
      icon: Trophy,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      label: t('stats.savedAnalyses'),
      value: savedAnalyses,
      icon: BookMarked,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
            <CardContent className="p-5 text-center relative z-10">
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-linear-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg shadow-zinc-200 dark:shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
