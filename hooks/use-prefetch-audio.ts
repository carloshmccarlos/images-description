'use client';

import { useEffect } from 'react';
import type { VocabularyItem } from '@/lib/db/schema';

export function usePrefetchAudio(vocabulary: VocabularyItem[], language: string) {
  useEffect(() => {
    if (!vocabulary?.length || !language) return;

    const lang = language.toLowerCase();

    // Pre-fetch audio URLs and preload audio for all vocabulary items
    vocabulary.forEach(async (item) => {
      const word = item.word?.toLowerCase?.() ?? item.word;

      try {
        const res = await fetch('/api/audio/vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang, word }),
        });

        if (res.ok) {
          const { audioUrl } = (await res.json()) as { audioUrl?: string };
          if (audioUrl) {
            // Preload the actual audio file into browser cache
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = audioUrl;
          }
        }
      } catch {
        // Silently fail - audio will be fetched on demand
      }
    });
  }, [vocabulary, language]);
}
