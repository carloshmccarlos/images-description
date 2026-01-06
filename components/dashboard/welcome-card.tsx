'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface WelcomeCardProps {
  userName: string;
  learningLanguage: string;
  learningFlag: string;
  nativeLanguage?: string;
  nativeFlag?: string;
  remainingAnalyses: number;
}

export function WelcomeCard({
  userName,
  learningLanguage,
  learningFlag,
  remainingAnalyses,
}: WelcomeCardProps) {
  const { t } = useTranslation('dashboard');
  const greeting = useGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/75 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/45"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-70 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[100%_28px] dark:opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_20%,rgba(14,165,233,0.14),transparent_55%),radial-gradient(900px_circle_at_85%_15%,rgba(16,185,129,0.12),transparent_58%),radial-gradient(900px_circle_at_65%_90%,rgba(245,158,11,0.10),transparent_55%)]" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/10">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">{greeting}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t('welcome.greeting')}</span>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white"
            >
              {userName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-600 dark:text-zinc-300 text-lg flex items-center gap-2 flex-wrap"
            >
              <span>{t('welcome.learningFrom')}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-sm">
                <span className="text-xl leading-none">{learningFlag}</span>
                <span>{learningLanguage}</span>
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-start md:items-end gap-3"
          >
            <div className="px-4 py-2 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm rounded-full border border-zinc-200 dark:border-zinc-800">
              <span className="font-semibold text-zinc-900 dark:text-white">{remainingAnalyses} {t('welcome.analysesLeft')}</span>
            </div>
            <Link href="/analyze">
              <Button
                size="lg"
                className="bg-linear-to-r from-sky-600 via-teal-500 to-emerald-500 hover:from-sky-700 hover:via-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/10"
              >
                {t('welcome.startLearning')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function useGreeting(): string {
  const { t: tCommon } = useTranslation('common');
  const hour = new Date().getHours();
  if (hour < 12) return tCommon('greeting.morning');
  if (hour < 18) return tCommon('greeting.afternoon');
  return tCommon('greeting.evening');
}
