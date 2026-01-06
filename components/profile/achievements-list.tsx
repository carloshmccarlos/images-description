'use client';

import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Flame, BookOpen, Camera, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Achievement, UserStats } from '@/lib/db/schema';

interface AchievementsListProps {
  achievements: Achievement[];
  stats: UserStats | undefined;
}

const achievementDefinitions = [
  {
    type: 'words_10',
    title: 'Word Collector',
    description: 'Learn 10 words',
    icon: BookOpen,
    requirement: 10,
    statKey: 'totalWordsLearned' as const,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'words_50',
    title: 'Vocabulary Builder',
    description: 'Learn 50 words',
    icon: BookOpen,
    requirement: 50,
    statKey: 'totalWordsLearned' as const,
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    type: 'words_100',
    title: 'Word Master',
    description: 'Learn 100 words',
    icon: Star,
    requirement: 100,
    statKey: 'totalWordsLearned' as const,
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    type: 'analyses_5',
    title: 'Explorer',
    description: 'Complete 5 analyses',
    icon: Camera,
    requirement: 5,
    statKey: 'totalAnalyses' as const,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    type: 'analyses_20',
    title: 'Adventurer',
    description: 'Complete 20 analyses',
    icon: Target,
    requirement: 20,
    statKey: 'totalAnalyses' as const,
    gradient: 'from-purple-600 to-fuchsia-600',
  },
  {
    type: 'streak_3',
    title: 'Consistent',
    description: '3 day streak',
    icon: Flame,
    requirement: 3,
    statKey: 'longestStreak' as const,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    type: 'streak_7',
    title: 'Dedicated',
    description: '7 day streak',
    icon: Flame,
    requirement: 7,
    statKey: 'longestStreak' as const,
    gradient: 'from-red-500 to-rose-600',
  },
  {
    type: 'streak_30',
    title: 'Unstoppable',
    description: '30 day streak',
    icon: Zap,
    requirement: 30,
    statKey: 'longestStreak' as const,
    gradient: 'from-amber-500 to-yellow-500',
  },
];

export function AchievementsList({ achievements, stats }: AchievementsListProps) {
  const unlockedTypes = new Set(achievements.map((a) => a.type));

  return (
    <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 font-semibold tracking-tight">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievementDefinitions.map((achievement, index) => {
            const isUnlocked = unlockedTypes.has(achievement.type);
            const currentValue = stats?.[achievement.statKey] || 0;
            const progress = Math.min((currentValue / achievement.requirement) * 100, 100);

            return (
              <motion.div
                key={achievement.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-4 rounded-2xl border transition-all duration-300 ${isUnlocked
                    ? 'bg-white/80 dark:bg-zinc-900/80 border-amber-200/50 dark:border-amber-500/30 shadow-sm shadow-amber-500/5'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-75'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked
                        ? `bg-linear-to-br ${achievement.gradient} shadow-lg shadow-zinc-200 dark:shadow-black/20`
                        : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                  >
                    {isUnlocked ? (
                      <achievement.icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm tracking-tight ${isUnlocked ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{achievement.description}</p>
                    {!isUnlocked && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/30">
                          <div
                            className={`h-full bg-linear-to-r ${achievement.gradient} rounded-full transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">
                          {currentValue} / {achievement.requirement}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
