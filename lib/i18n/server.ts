import { headers } from 'next/headers';
import { type SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './locales';

// Re-export locale types for convenience
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './locales';

// Import translations directly for server-side usage (no i18next dependency)
import { commonTranslations } from './translations/common';
import { landingTranslations } from './translations/landing';
import { dashboardTranslations } from './translations/dashboard';
import { authTranslations } from './translations/auth';
import { settingsTranslations } from './translations/settings';
import { profileTranslations } from './translations/profile';
import { savedTranslations } from './translations/saved';
import { analyzeTranslations } from './analyze-translations';

const translations = {
  common: commonTranslations,
  landing: landingTranslations,
  dashboard: dashboardTranslations,
  auth: authTranslations,
  settings: settingsTranslations,
  profile: profileTranslations,
  saved: savedTranslations,
  analyze: analyzeTranslations,
} as const;

type TranslationNamespace = keyof typeof translations;

export function getLocaleFromAcceptLanguage(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase().split('-')[0]);
  
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
      return lang as SupportedLocale;
    }
  }
  
  return DEFAULT_LOCALE;
}

export async function getServerLocale(): Promise<SupportedLocale> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  return getLocaleFromAcceptLanguage(acceptLanguage);
}

// Server-side translation getter for use in Server Components
export function getTranslations<T extends TranslationNamespace>(
  namespace: T,
  locale: string
): (typeof translations)[T]['en'] {
  const normalizedLocale = locale.toLowerCase().split('-')[0];
  
  if (SUPPORTED_LOCALES.includes(normalizedLocale as SupportedLocale)) {
    return translations[namespace][normalizedLocale as SupportedLocale] as (typeof translations)[T]['en'];
  }
  
  return translations[namespace][DEFAULT_LOCALE] as (typeof translations)[T]['en'];
}
