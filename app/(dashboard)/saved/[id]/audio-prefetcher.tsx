'use client';

import { useEffect } from 'react';
import { usePrefetchAudio } from '@/hooks/use-prefetch-audio';
import type { VocabularyItem } from '@/lib/types/analysis';

interface AudioPrefetcherProps {
  vocabulary: VocabularyItem[];
  language: string;
  descriptionAudioUrl?: string | null;
  descriptionNativeAudioUrl?: string | null;
}

export function AudioPrefetcher({
  vocabulary,
  language,
  descriptionAudioUrl,
  descriptionNativeAudioUrl,
}: AudioPrefetcherProps) {
  usePrefetchAudio(vocabulary, language);

  useEffect(() => {
    const urls = [descriptionAudioUrl, descriptionNativeAudioUrl].filter(Boolean) as string[];
    if (!urls.length) return;

    urls.forEach((url) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
    });
  }, [descriptionAudioUrl, descriptionNativeAudioUrl]);
  return null;
}
