'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyUsageSummary } from '@/lib/types/stats';

interface LearningProgressProps {
  recentActivity: DailyUsageSummary[];
}

export function LearningProgress({ recentActivity }: LearningProgressProps) {
  // Generate last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const activityMap = new Map(
    recentActivity.map((a) => [a.date, a.usageCount])
  );

  const maxUsage = Math.max(...recentActivity.map((a) => a.usageCount), 5);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 font-semibold tracking-tight">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Weekly Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-end justify-between gap-3 h-40">
          {days.map((date, index) => {
            const usage = activityMap.get(date) || 0;
            const height = usage > 0 ? Math.max((usage / maxUsage) * 100, 15) : 8;
            const dayOfWeek = new Date(date).getDay();
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full group">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${usage > 0
                        ? 'bg-linear-to-t from-emerald-600 to-sky-400'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                      } ${isToday ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 shadow-lg' : ''}`}
                  />
                  {usage > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none">
                      {usage}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-tighter ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                    {dayNames[dayOfWeek]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 font-medium">This week&apos;s explorations</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-lg leading-none">
                {recentActivity.reduce((sum, a) => sum + a.usageCount, 0)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
