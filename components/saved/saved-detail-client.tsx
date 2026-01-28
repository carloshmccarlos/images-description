'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useSavedAnalysis } from '@/hooks/use-saved-analyses';
import { useLanguage } from '@/hooks/use-language';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { VocabularyCard } from '@/components/analysis/vocabulary-card';
import { formatDate } from '@/lib/utils';
import { DeleteAnalysisButton } from '@/app/(dashboard)/saved/[id]/delete-button';
import { SyncHeightLayout } from '@/app/(dashboard)/saved/[id]/sync-height-layout';
import { DescriptionCard } from '@/app/(dashboard)/saved/[id]/description-card';
import { AudioPrefetcher } from '@/app/(dashboard)/saved/[id]/audio-prefetcher';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SavedDetailClientProps {
  id: string;
}

export function SavedDetailClient({ id }: SavedDetailClientProps) {
  const t = useTranslations('saved');
  const { locale } = useLanguage();
  const { data: analysis, isLoading, error } = useSavedAnalysis(id);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto space-y-10 pb-12">
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !analysis) {
    return (
      <div className="max-w-screen-2xl mx-auto space-y-10 pb-12">
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-8 space-y-4 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              {t('detail.loadError')}
            </p>
            <Link href={`/${locale}/saved`}>
              <Button variant="outline">{t('detail.backToSaved')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leftSection = (
    <div className="space-y-8">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-[32px] border-4 border-white dark:border-zinc-900 shadow-2xl shadow-zinc-200 dark:shadow-black/40 group">
        <Image
          src={`/api/image?url=${encodeURIComponent(analysis.imageUrl)}`}
          alt="Analysis"
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <DescriptionCard
        analysisId={analysis.id}
        description={analysis.description}
        descriptionNative={analysis.descriptionNative}
        descriptionAudioUrl={analysis.descriptionAudioUrl}
        descriptionNativeAudioUrl={analysis.descriptionNativeAudioUrl}
        createdAtLabel={formatDate(analysis.createdAt)}
        translations={{
          description: t('detail.description'),
          translated: t('detail.translated'),
          native: t('detail.native'),
          listen: t('detail.listen'),
        }}
      />
    </div>
  );

  const rightSection = (
    <>
      <div className="flex items-center justify-between px-4 mb-6">
        <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('detail.vocabulary')}
        </h3>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
            {analysis.vocabulary.length} {t('detail.words')}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {analysis.vocabulary.map((item, index) => (
          <VocabularyCard
            key={index}
            item={item}
            index={index}
            language={analysis.learningLanguage ?? 'en'}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-12">
      <AudioPrefetcher
        vocabulary={analysis.vocabulary}
        language={analysis.learningLanguage ?? 'en'}
        descriptionAudioUrl={analysis.descriptionAudioUrl}
        descriptionNativeAudioUrl={analysis.descriptionNativeAudioUrl}
      />
      <div className="flex items-center justify-between px-2">
        <Link href={`/${locale}/saved`}>
          <Button variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            {t('detail.backToSaved')}
          </Button>
        </Link>
        <DeleteAnalysisButton id={analysis.id} />
      </div>

      <SyncHeightLayout
        leftContent={leftSection}
        rightContent={rightSection}
      />
    </div>
  );
}
