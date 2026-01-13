'use client';

import { usePrefetchAudio } from '@/hooks/use-prefetch-audio';
import type { VocabularyItem } from '@/lib/db/schema';

interface AudioPrefetcherProps {
  vocabulary: VocabularyItem[];
  language: string;
}

export function AudioPrefetcher({ vocabulary, language }: AudioPrefetcherProps) {
  usePrefetchAudio(vocabulary, language);
  return null;
}
