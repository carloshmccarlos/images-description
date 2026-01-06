'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './config';
import { type SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './locales';

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set initial locale if provided (from server-side detection)
    if (initialLocale && SUPPORTED_LOCALES.includes(initialLocale)) {
      i18n.changeLanguage(initialLocale);
    }
    setIsInitialized(true);
  }, [initialLocale]);

  // Render children immediately - i18next handles hydration
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

// Helper to change language
export function changeLanguage(locale: SupportedLocale) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    i18n.changeLanguage(locale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
  }
}

// Get current language
export function getCurrentLanguage(): SupportedLocale {
  const lang = i18n.language?.split('-')[0];
  if (lang && SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}
