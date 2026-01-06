'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, BookMarked, Settings, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface QuickActionsProps {
  canAnalyze: boolean;
}

export function QuickActions({ canAnalyze }: QuickActionsProps) {
  const { t } = useTranslation('dashboard');

  const actions = [
    {
      href: '/analyze',
      label: t('quickActions.analyzeImage'),
      description: t('quickActions.analyzeImageDesc'),
      icon: Camera,
      gradient: 'from-sky-600 to-teal-500',
      requiresAnalysis: true,
    },
    {
      href: '/saved',
      label: t('quickActions.viewSaved'),
      description: t('quickActions.viewSavedDesc'),
      icon: BookMarked,
      gradient: 'from-emerald-600 to-sky-500',
      requiresAnalysis: false,
    },
    {
      href: '/profile',
      label: t('quickActions.progress'),
      description: t('quickActions.progressDesc'),
      icon: TrendingUp,
      gradient: 'from-amber-500 to-emerald-500',
      requiresAnalysis: false,
    },
    {
      href: '/settings',
      label: t('quickActions.settings'),
      description: t('quickActions.settingsDesc'),
      icon: Settings,
      gradient: 'from-zinc-500 to-zinc-700',
      requiresAnalysis: false,
    },
  ];

  return (
    <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {t('quickActions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const isDisabled = action.requiresAnalysis && !canAnalyze;

          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={isDisabled ? '#' : action.href}
                className={cn(isDisabled && 'pointer-events-none')}
              >
                <div className={cn(
                  'group flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all',
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                )}>
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-linear-to-br flex items-center justify-center text-white shadow-lg',
                    action.gradient
                  )}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-sm text-zinc-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
