// Shared locale definitions - safe for both server and client
// Using BCP-47-ish lower-case tags with region for Chinese variants
export const SUPPORTED_LOCALES = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
