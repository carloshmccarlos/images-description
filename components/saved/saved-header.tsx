'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, BookMarked, BookOpen, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/hooks/use-language';

interface SavedHeaderProps {
  totalAnalyses: number;
  totalWords: number;
  searchQuery?: string;
}

export function SavedHeader({ totalAnalyses, totalWords, searchQuery }: SavedHeaderProps) {
  const t = useTranslations('saved');
  const { locale } = useLanguage();
  const [query, setQuery] = useState(searchQuery || '');
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
      params.delete('page');
    } else {
      params.delete('q');
    }
    router.push(`/${locale}/saved?${params.toString()}`);
  }

  function clearSearch() {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    router.push(`/${locale}/saved?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            {t('header.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 mt-2 text-lg"
          >
            {t('header.subtitle')}
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSearch}
          className="relative w-full md:w-96"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
          <Input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 pr-11 h-12 rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </motion.form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
            <div className="absolute inset-0 opacity-50 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20 shadow-sm">
                <BookMarked className="w-7 h-7 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">{totalAnalyses}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-1">{t('header.totalAnalyses')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
            <div className="absolute inset-0 opacity-50 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">{totalWords}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-1">{t('header.wordsCaptured')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-zinc-500">{t('header.showingResults')}</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md font-medium">
            &quot;{searchQuery}&quot;
          </span>
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            {t('header.clear')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
