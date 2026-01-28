'use client';

import { useEffect } from 'react';
import type { VocabularyItem } from '@/lib/types/analysis';
import { ensureAudioCached } from '@/lib/audio/audio-cache';
import { useAudioStore } from '@/stores/audio-store';

const audioUrlCache = new Map<string, string>();
const inFlight = new Set<string>();
const DEFAULT_CONCURRENCY = 4;

interface PrefetchOptions {
  maxItems?: number;
  concurrency?: number;
}

function buildCacheKey(language: string, word: string): string {
  return `${language}:${word}`;
}

export function usePrefetchAudio(
  vocabulary: VocabularyItem[],
  language: string,
  options: PrefetchOptions = {}
) {
  const setCachedUrl = useAudioStore((state) => state.setCachedUrl);

  useEffect(() => {
    if (!vocabulary?.length || !language) return;

    const lang = language.toLowerCase();
    const maxItems = options.maxItems ?? vocabulary.length;
    const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
    const queue = vocabulary.slice(0, maxItems);
    let isCancelled = false;

    async function prefetchItem(item: VocabularyItem): Promise<void> {
      const word = item.word?.toLowerCase?.() ?? item.word;
      if (!word) return;
      const cacheKey = buildCacheKey(lang, word);
      if (audioUrlCache.has(cacheKey) || inFlight.has(cacheKey)) return;

      inFlight.add(cacheKey);
      try {
        const res = await fetch('/api/audio/vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang, word }),
        });

        if (res.ok) {
          const { audioUrl } = (await res.json()) as { audioUrl?: string };
          if (audioUrl) {
            audioUrlCache.set(cacheKey, audioUrl);
            setCachedUrl(lang, word, audioUrl);
            await ensureAudioCached(audioUrl);
          }
        }
      } catch {
        // Silently fail - audio will be fetched on demand
      } finally {
        inFlight.delete(cacheKey);
      }
    }

    async function runQueue(): Promise<void> {
      let index = 0;

      async function worker(): Promise<void> {
        while (!isCancelled) {
          const item = queue[index];
          if (!item) break;
          index += 1;
          await prefetchItem(item);
        }
      }

      await Promise.all(
        Array.from({ length: concurrency }, () => worker())
      );
    }

    runQueue();

    return () => {
      isCancelled = true;
    };
  }, [vocabulary, language, options.concurrency, options.maxItems, setCachedUrl]);
}
