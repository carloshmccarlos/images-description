'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

function withLocalePrefix(path: string, nextLocale: Locale) {
  const parts = path.split('/').filter(Boolean);
  const first = parts[0]?.toLowerCase();
  const rest = first && (locales as readonly string[]).includes(first)
    ? `/${parts.slice(1).join('/')}`
    : `/${parts.join('/')}`;
  const normalizedRest = rest === '/' ? '' : rest;
  return `/${nextLocale}${normalizedRest}`;
}

export function useLanguage() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = useCallback((newLocale: Locale) => {
    // Set cookie for server-side
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    // Navigate to new locale path
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const newPath = `${withLocalePrefix(pathname, newLocale)}${search}`;
    
    // Use router for navigation
    router.push(newPath);
    router.refresh();
  }, [pathname, router]);

  return {
    locale,
    changeLanguage,
  };
}

// Language display names
export const languageNames: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '中文（简体）',
  'zh-tw': '中文（繁體）',
  ja: '日本語',
  ko: '한국어',
};

// Language flags (emoji)
export const languageFlags: Record<Locale, string> = {
  en: '🇺🇸',
  'zh-cn': '🇨🇳',
  'zh-tw': '🇹🇼',
  ja: '🇯🇵',
  ko: '🇰🇷',
};
