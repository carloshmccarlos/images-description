export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-cn', name: '中文（简体）', flag: '🇨🇳' },
  { code: 'zh-tw', name: '中文（繁體）', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const;

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Can hold basic conversations' },
  { value: 'advanced', label: 'Advanced', description: 'Fluent in most situations' },
] as const;

export const DAILY_FREE_LIMIT = 10;

export const IMAGE_CONFIG = {
  maxSizeKB: 500,
  maxSizeBytes: 500 * 1024,
  supportedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
};

export const APP_CONFIG = {
  name: 'LexiLens',
  description: 'Learn vocabulary through images',
  resetTimeUTC: 0, // 00:00 UTC
};
