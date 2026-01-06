'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './locales';

// Import all translation resources
import { commonTranslations } from './translations/common';
import { landingTranslations } from './translations/landing';
import { dashboardTranslations } from './translations/dashboard';
import { authTranslations } from './translations/auth';
import { settingsTranslations } from './translations/settings';
import { profileTranslations } from './translations/profile';
import { savedTranslations } from './translations/saved';
import { analyzeTranslations } from './analyze-translations';

// Re-export from locales.ts for client-side usage
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './locales';

// Build resources object for i18next
const resources = {
  en: {
    common: commonTranslations.en,
    landing: landingTranslations.en,
    dashboard: dashboardTranslations.en,
    auth: authTranslations.en,
    settings: settingsTranslations.en,
    profile: profileTranslations.en,
    saved: savedTranslations.en,
    analyze: analyzeTranslations.en,
  },
  zh: {
    common: commonTranslations.zh,
    landing: landingTranslations.zh,
    dashboard: dashboardTranslations.zh,
    auth: authTranslations.zh,
    settings: settingsTranslations.zh,
    profile: profileTranslations.zh,
    saved: savedTranslations.zh,
    analyze: analyzeTranslations.zh,
  },
  ja: {
    common: commonTranslations.ja,
    landing: landingTranslations.ja,
    dashboard: dashboardTranslations.ja,
    auth: authTranslations.ja,
    settings: settingsTranslations.ja,
    profile: profileTranslations.ja,
    saved: savedTranslations.ja,
    analyze: analyzeTranslations.ja,
  },
  ko: {
    common: commonTranslations.ko,
    landing: landingTranslations.ko,
    dashboard: dashboardTranslations.ko,
    auth: authTranslations.ko,
    settings: settingsTranslations.ko,
    profile: profileTranslations.ko,
    saved: savedTranslations.ko,
    analyze: analyzeTranslations.ko,
  },
} as const;

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    lng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: 'common',
    ns: ['common', 'landing', 'dashboard', 'auth', 'settings', 'profile', 'saved', 'analyze'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

export default i18n;
