// Script to convert TypeScript translations to JSON for next-intl
// Run with: bun run scripts/convert-translations.ts

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Import all translations
import { commonTranslations } from '../lib/i18n/translations/common';
import { dashboardTranslations } from '../lib/i18n/translations/dashboard';
import { authTranslations } from '../lib/i18n/translations/auth';
import { settingsTranslations } from '../lib/i18n/translations/settings';
import { profileTranslations } from '../lib/i18n/translations/profile';
import { savedTranslations } from '../lib/i18n/translations/saved';
import { analyzeTranslations } from '../lib/i18n/analyze-translations';
import { landingTranslations } from '../lib/i18n/translations/landing';
import { adminTranslations } from '../lib/i18n/translations/admin';

const locales = ['en', 'zh', 'ja', 'ko'] as const;
const localeMapping: Record<string, string[]> = {
  en: ['en'],
  zh: ['zh-cn', 'zh-tw'],
  ja: ['ja'],
  ko: ['ko'],
};

const outputDir = join(__dirname, '../i18n/messages');

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

for (const sourceLocale of locales) {
  const targetLocales = localeMapping[sourceLocale];
  
  const messages = {
    common: commonTranslations[sourceLocale],
    dashboard: dashboardTranslations[sourceLocale],
    auth: authTranslations[sourceLocale],
    settings: settingsTranslations[sourceLocale],
    profile: profileTranslations[sourceLocale],
    saved: savedTranslations[sourceLocale],
    analyze: analyzeTranslations[sourceLocale],
    landing: landingTranslations[sourceLocale],
    admin: adminTranslations[sourceLocale],
  };

  for (const targetLocale of targetLocales) {
    const outputPath = join(outputDir, `${targetLocale}.json`);
    writeFileSync(outputPath, JSON.stringify(messages, null, 2));
    console.log(`Generated: ${outputPath}`);
  }
}

console.log('Done!');
