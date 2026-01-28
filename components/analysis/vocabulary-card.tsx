'use client';

import { useState } from 'react';
import { Volume2, Loader2, BookOpen, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VocabularyItem } from '@/lib/types/analysis';
import { useAudioStore } from '@/stores/audio-store';
import { ensureAudioCached, getCachedAudioObjectUrl } from '@/lib/audio/audio-cache';

interface VocabularyCardProps {
  item: VocabularyItem;
  index: number;
  language?: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  noun: { 
    bg: 'bg-sky-50 dark:bg-sky-500/10', 
    text: 'text-sky-600 dark:text-sky-400', 
    border: 'border-sky-100 dark:border-sky-500/20',
    icon: 'text-sky-500'
  },
  verb: { 
    bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
    text: 'text-emerald-600 dark:text-emerald-400', 
    border: 'border-emerald-100 dark:border-emerald-500/20',
    icon: 'text-emerald-500'
  },
  adjective: { 
    bg: 'bg-amber-50 dark:bg-amber-500/10', 
    text: 'text-amber-600 dark:text-amber-400', 
    border: 'border-amber-100 dark:border-amber-500/20',
    icon: 'text-amber-500'
  },
  adverb: { 
    bg: 'bg-purple-50 dark:bg-purple-500/10', 
    text: 'text-purple-600 dark:text-purple-400', 
    border: 'border-purple-100 dark:border-purple-500/20',
    icon: 'text-purple-500'
  },
  default: { 
    bg: 'bg-zinc-50 dark:bg-zinc-900', 
    text: 'text-zinc-600 dark:text-zinc-400', 
    border: 'border-zinc-200 dark:border-zinc-800',
    icon: 'text-zinc-400'
  },
};

export function VocabularyCard({ item, index, language }: VocabularyCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPlaying: globalIsPlaying, currentWord, setPlaying, getCachedUrl, setCachedUrl } = useAudioStore();

  const category = item.category?.toLowerCase() || 'default';
  const colors = categoryColors[category] || categoryColors.default;
  const word = item.word?.toLowerCase?.() ?? item.word;
  const isThisPlaying = globalIsPlaying && currentWord === word;
  const isDisabled = isLoading || (globalIsPlaying && currentWord !== word);

  async function handleSpeak() {
    const lang = (language ?? 'en').toLowerCase();
    let cachedObjectUrl: string | null = null;

    setIsLoading(true);
    setPlaying(word);

    try {
      // Check cache first
      let audioUrl = getCachedUrl(lang, word);
      
      if (!audioUrl) {
        // Fetch from API only if not cached
        const res = await fetch('/api/audio/vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang, word }),
        });

        const data = (await res.json()) as { audioUrl?: string };
        if (!res.ok || !data.audioUrl) throw new Error('No audio URL');
        
        audioUrl = data.audioUrl;
        // Cache the URL for future plays
        setCachedUrl(lang, word, audioUrl);
      }

      cachedObjectUrl = await getCachedAudioObjectUrl(audioUrl);
      const playbackUrl = cachedObjectUrl ?? audioUrl;

      if (!cachedObjectUrl) {
        void ensureAudioCached(audioUrl);
      }

      const audio = new Audio(playbackUrl);
      setIsLoading(false);
      audio.onended = () => {
        if (cachedObjectUrl) URL.revokeObjectURL(cachedObjectUrl);
        setPlaying(null);
      };
      audio.onerror = () => {
        if (cachedObjectUrl) URL.revokeObjectURL(cachedObjectUrl);
        // Fallback to Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.onend = () => setPlaying(null);
          utterance.onerror = () => setPlaying(null);
          speechSynthesis.speak(utterance);
        } else {
          setPlaying(null);
        }
      };
      await audio.play();
    } catch {
      setIsLoading(false);
      if (cachedObjectUrl) URL.revokeObjectURL(cachedObjectUrl);
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.onend = () => setPlaying(null);
        utterance.onerror = () => setPlaying(null);
        speechSynthesis.speak(utterance);
      } else {
        setPlaying(null);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer ${colors.border} border-2 bg-white/75 backdrop-blur-sm dark:bg-zinc-950/40 relative`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] pointer-events-none" />
        <CardContent className="p-0 relative z-10">
          <div className={`p-5 ${colors.bg} border-b ${colors.border} transition-colors duration-300 group-hover:bg-opacity-80`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">
                    {item.word?.toLowerCase?.() ?? item.word}
                  </h4>
                  {item.category && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} shadow-sm`}>
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1.5 font-mono tracking-tight">{item.pronunciation}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak();
                }}
                disabled={isDisabled}
                className={`shrink-0 rounded-xl w-12 h-12 ${colors.bg} border ${colors.border} shadow-sm hover:scale-105 active:scale-95 transition-all ${isDisabled && !isThisPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading || isThisPlaying ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 ">
              <div className={`mt-1 w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                <BookOpen className={`w-3.5 h-3.5 ${colors.icon}`} />
              </div>
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                {item.translation}
              </p>
            </div>

            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                  &ldquo;{item.exampleSentence}&rdquo;
                </p>
              </div>
            </motion.div>

            {!isExpanded && (
              <div className="flex items-center justify-center pt-2">
                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Details
                </span>
                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
