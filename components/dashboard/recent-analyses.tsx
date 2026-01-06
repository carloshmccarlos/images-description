'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { VocabularyItem } from '@/lib/db/schema';

interface RecentAnalysis {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface RecentAnalysesProps {
  analyses: RecentAnalysis[];
}

export function RecentAnalyses({ analyses }: RecentAnalysesProps) {
  const { t } = useTranslation('dashboard');

  if (analyses.length === 0) {
    return (
      <Card className="border-dashed h-full flex flex-col justify-center">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t('recentAnalyses.noAnalyses')}</h3>
          <p className="text-zinc-500 mb-4 max-w-sm">
            {t('recentAnalyses.noAnalysesDesc')}
          </p>
          <Link href="/analyze">
            <Button>
              {t('recentAnalyses.analyzeFirst')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 relative overflow-hidden h-full flex flex-col">
      <div className="absolute inset-0 opacity-50 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_28px] dark:opacity-10" />
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <CardTitle className="text-xl font-semibold tracking-tight">{t('recentAnalyses.title')}</CardTitle>
        <Link href="/saved">
          <Button variant="ghost" size="sm" className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {t('recentAnalyses.viewAll')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid sm:grid-cols-2 gap-6">
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/saved/${analysis.id}`}>
                <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 bg-white/50 dark:bg-zinc-900/50">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={analysis.imageUrl.startsWith('data:')
                        ? analysis.imageUrl
                        : `/api/image?url=${encodeURIComponent(analysis.imageUrl)}`}
                      alt="Analysis"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-white/90 text-xs mb-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        {formatDate(analysis.createdAt)}
                      </div>
                      <p className="text-white font-semibold line-clamp-2 text-sm leading-snug">
                        {analysis.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {analysis.vocabulary.length} {t('recentAnalyses.words')}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
