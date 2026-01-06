'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Camera, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VocabularyCard } from './vocabulary-card';
import type { VocabularyItem } from '@/lib/db/schema';

interface AnalysisCompleteProps {
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  onViewAnalysis: () => void;
  onAnalyzeAnother: () => void;
  translations?: {
    successBanner: string;
    description: string;
    capturedVocabulary: string;
    words: string;
    moreWords: string;
    analyzeAnother: string;
    viewFullAnalysis: string;
  };
}

export function AnalysisComplete({
  imageUrl,
  description,
  vocabulary,
  onViewAnalysis,
  onAnalyzeAnother,
  translations,
}: AnalysisCompleteProps) {
  const t = translations || {
    successBanner: 'Analysis saved to your library!',
    description: 'Description',
    capturedVocabulary: 'Captured Vocabulary',
    words: 'words',
    moreWords: 'more words in your library',
    analyzeAnother: 'Analyze Another',
    viewFullAnalysis: 'View Full Analysis',
  };
  
  const isDataUrl = imageUrl.startsWith('data:');
  const displayUrl = isDataUrl
    ? imageUrl
    : `/api/image?url=${encodeURIComponent(imageUrl)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
      >
        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
          {t.successBanner}
        </span>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="relative w-full aspect-video overflow-hidden rounded-3xl border border-zinc-200 shadow-2xl shadow-zinc-200/50 dark:border-zinc-800 dark:shadow-none bg-white dark:bg-zinc-950 group">
            <Image
              src={displayUrl}
              alt="Analyzed"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized={isDataUrl || displayUrl.startsWith('/api/image')}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-xl font-semibold tracking-tight">{t.description}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg italic">
                &ldquo;{description}&rdquo;
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {t.capturedVocabulary}
            </h3>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {vocabulary.length} {t.words}
              </span>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            {vocabulary.slice(0, 6).map((item, index) => (
              <VocabularyCard key={index} item={item} index={index} />
            ))}
          </div>
          {vocabulary.length > 6 && (
            <p className="text-center text-sm text-zinc-500">
              +{vocabulary.length - 6} {t.moreWords}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <Button 
          variant="outline" 
          onClick={onAnalyzeAnother}
          className="h-12 px-8 rounded-xl font-bold border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50 transition-all active:scale-[0.98]"
        >
          <Camera className="h-5 w-5 mr-2" />
          {t.analyzeAnother}
        </Button>
        <Button 
          onClick={onViewAnalysis}
          className="h-12 px-10 rounded-xl font-bold bg-linear-to-r from-sky-600 to-emerald-500 hover:from-sky-700 hover:to-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
        >
          {t.viewFullAnalysis}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
