// Shared locale definitions - safe for both server and client
export const SUPPORTED_LOCALES = ['en', 'zh', 'ja', 'ko'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
