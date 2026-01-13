import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  currentWord: string | null;
  audioCache: Map<string, string>; // key: `${lang}:${word}`, value: audioUrl
  setPlaying: (word: string | null) => void;
  getCachedUrl: (lang: string, word: string) => string | undefined;
  setCachedUrl: (lang: string, word: string, url: string) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  currentWord: null,
  audioCache: new Map(),
  setPlaying: (word) => set({ isPlaying: word !== null, currentWord: word }),
  getCachedUrl: (lang, word) => get().audioCache.get(`${lang}:${word}`),
  setCachedUrl: (lang, word, url) => {
    const cache = new Map(get().audioCache);
    cache.set(`${lang}:${word}`, url);
    set({ audioCache: cache });
  },
}));
