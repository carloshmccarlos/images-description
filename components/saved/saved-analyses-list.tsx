'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Clock, BookOpen, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { VocabularyItem } from '@/lib/db/schema';
import { useLanguage } from '@/hooks/use-language';

interface AnalysisItem {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

interface SavedAnalysesListProps {
  analyses: AnalysisItem[];
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
}

export function SavedAnalysesList({
  analyses,
  currentPage,
  totalPages,
  searchQuery,
}: SavedAnalysesListProps) {
  const t = useTranslations('saved');
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/${locale}/saved?${params.toString()}`);
  }

  if (analyses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="font-semibold text-xl mb-2">
            {searchQuery ? t('list.noResults') : t('list.noAnalyses')}
          </h3>
          <p className="text-zinc-500 mb-6 max-w-sm">
            {searchQuery
              ? t('list.noResultsDesc', { query: searchQuery })
              : t('list.noAnalysesDesc')}
          </p>
          <Link href={`/${locale}/analyze`}>
            <Button>
              <Camera className="w-4 h-4 mr-2" />
              {t('list.analyzeImage')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/${locale}/saved/${analysis.id}`}>
              <Card className="group overflow-hidden border border-zinc-200 bg-white/75 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={analysis.imageUrl.startsWith('data:')
                      ? analysis.imageUrl
                      : `/api/image?url=${encodeURIComponent(analysis.imageUrl)}`}
                    alt="Analysis"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium line-clamp-2 leading-relaxed">
                      {analysis.description}
                    </p>
                  </div>
                </div>
                <CardContent className="p-5 relative">
                  <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
                        {formatDate(analysis.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {analysis.vocabulary.length} {t('list.words')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-4">
                      {analysis.description}
                    </p>
                    <div className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all duration-300">
                      {t('list.viewExploration')}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('list.previous')}
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'ghost'}
                size="sm"
                onClick={() => goToPage(page)}
                className={cn(
                  "w-10 h-10 rounded-xl font-bold transition-all",
                  page === currentPage 
                    ? "bg-linear-to-r from-sky-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            {t('list.next')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
