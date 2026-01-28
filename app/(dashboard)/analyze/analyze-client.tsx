'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ImageUploader } from '@/components/image/image-uploader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';
import { useAnalyzeImage, useAnalyzeTaskStatus, usePendingAnalyzeTask } from '@/hooks/use-analyze-task';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';


type AnalysisState = 'idle' | 'analyzing' | 'error';

type AnalyzeError = Error & { status?: number; data?: { taskId?: string; status?: string; error?: string } };

export function AnalyzeClient() {
  const t = useTranslations('analyze');
  const router = useRouter();
  const { locale } = useLanguage();
  const queryClient = useQueryClient();

  const { data: pendingData } = usePendingAnalyzeTask();
  const pendingTaskId = pendingData?.task?.id ?? null;
  const { data: taskData, error: taskError } = useAnalyzeTaskStatus(pendingTaskId);
  const analyzeMutation = useAnalyzeImage();

  const [state, setState] = useState<AnalysisState>(pendingTaskId ? 'analyzing' : 'idle');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingTaskId) {
      setState('analyzing');
    }
  }, [pendingTaskId]);

  useEffect(() => {
    if (!taskData) return;

    if (taskData.status === 'error') {
      setError(taskData.errorMessage || t('errorTitle'));
      setState('error');
      queryClient.setQueryData(queryKeys.pendingAnalyzeTask, { task: null });
      return;
    }

    if (taskData.status === 'completed' && taskData.savedAnalysisId) {
      queryClient.setQueryData(queryKeys.pendingAnalyzeTask, { task: null });
      router.push(`/${locale}/saved/${taskData.savedAnalysisId}`);
    }
  }, [locale, queryClient, router, t, taskData]);

  useEffect(() => {
    if (!taskError) return;
    const message = taskError instanceof Error ? taskError.message : t('errorTitle');
    setError(message);
    setState('error');
  }, [t, taskError]);

  function handleImageSelect(file: File, preview: string) {
    setSelectedImage(preview);
    setSelectedFile(file);
    setError(null);
  }

  function handleClear() {
    setSelectedImage(null);
    setSelectedFile(null);
    setState('idle');
    setError(null);
  }

  async function handleAnalyze() {
    if (!selectedFile || analyzeMutation.isPending) return;

    setState('analyzing');
    setError(null);

    try {
      const data = await analyzeMutation.mutateAsync(selectedFile);

      if (data?.id) {
        toast.success(t('successBanner'), {
          description: `${data.vocabulary?.length || 0} ${t('wordsAdded')}`,
        });

        router.push(`/${locale}/saved/${data.id}`);
      }
    } catch (err) {
      const errorObject = err as AnalyzeError;
      if (errorObject.status === 429) {
        setError(t('dailyLimitReached'));
        setState('error');
        return;
      }

      if (errorObject.status === 409 && errorObject.data?.taskId) {
        queryClient.setQueryData(queryKeys.pendingAnalyzeTask, {
          task: {
            id: errorObject.data.taskId,
            status: (errorObject.data.status as 'pending' | 'analyzing') ?? 'pending',
          },
        });
        setState('analyzing');
        return;
      }

      const message = errorObject?.message || t('errorTitle');
      setError(message);
      setState('error');
      toast.error(t('errorTitle'), { description: message });
    }
  }

  const showAnalyzing = state === 'analyzing';
  const showUploader = state === 'idle';
  const showError = state === 'error';

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('badge')}</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold"
        >
          {t('title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 max-w-md mx-auto"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {showUploader && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ImageUploader
              onImageSelect={handleImageSelect}
              onClear={handleClear}
              selectedImage={selectedImage}
            />

            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button size="lg" onClick={handleAnalyze} className="px-8" disabled={analyzeMutation.isPending}>
                  {analyzeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 mr-2" />
                  )}
                  {t('analyzeButton')}
                </Button>
              </motion.div>
            )}

            {!selectedImage && (
              <Card className="border-dashed bg-zinc-50/50 dark:bg-zinc-900/50">
                <CardContent className="py-8">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-4">
                      {['🍎', '🚗', '📚', '🏠'].map((emoji, i) => (
                        <motion.span
                          key={emoji}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="text-4xl"
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </div>
                    <p className="text-zinc-500 text-sm">{t('uploadHint')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {showAnalyzing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border border-zinc-200 bg-white/75 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
              <CardContent className="py-16">
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-20 h-20 rounded-2xl bg-linear-to-br from-sky-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/25"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {t('analyzing')}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {t('progressAnalyzing')}
                    </p>
                  </div>
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">{t('errorTitle')}</h3>
                    <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                  <Button variant="outline" onClick={handleClear}>
                    {t('tryAgain')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
