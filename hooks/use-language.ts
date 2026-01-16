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
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    const search = typeof window !== 'undefined' ? window.location.search : '';
    const newPath = `${withLocalePrefix(pathname, newLocale)}${search}`;
    router.push(newPath);
    router.refresh();
  }, [pathname, router]);

  return {
    locale,
    changeLanguage,
  };
}

export const languageNames: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '\u4e2d\u6587\uff08\u7b80\u4f53\uff09',
  'zh-tw': '\u4e2d\u6587\uff08\u7e41\u9ad4\uff09',
  ja: '\u65e5\u672c\u8a9e',
  ko: '\ud55c\uad6d\uc5b4',
};

export const languageFlags: Record<Locale, string> = {
  en: '\u{1F1FA}\u{1F1F8}',
  'zh-cn': '\u{1F1E8}\u{1F1F3}',
  'zh-tw': '\u{1F1F9}\u{1F1FC}',
  ja: '\u{1F1EF}\u{1F1F5}',
  ko: '\u{1F1F0}\u{1F1F7}',
};
