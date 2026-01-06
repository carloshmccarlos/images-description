// Server-side exports (safe for Server Components)
export { 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  type SupportedLocale,
  getLocaleFromAcceptLanguage, 
  getServerLocale, 
  getTranslations 
} from './server';

// Re-export translations (these are plain objects, safe for both server and client)
export { commonTranslations, type CommonTranslations } from './translations/common';
export { landingTranslations, type LandingTranslations } from './translations/landing';
export { dashboardTranslations, type DashboardTranslations } from './translations/dashboard';
export { authTranslations, type AuthTranslations } from './translations/auth';
export { settingsTranslations, type SettingsTranslations } from './translations/settings';
export { profileTranslations, type ProfileTranslations } from './translations/profile';
export { savedTranslations, type SavedTranslations } from './translations/saved';
export { analyzeTranslations, getAnalyzeTranslations, type AnalyzeTranslationKey } from './analyze-translations';
