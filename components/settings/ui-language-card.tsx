'use client';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';
import { useLanguage } from '@/hooks/use-language';

const UI_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-cn', name: '中文（简体）', flag: '🇨🇳' },
  { code: 'zh-tw', name: '中文（繁體）', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const;

export function UILanguageCard() {
  const t = useTranslations('settings');
  const { locale, changeLanguage } = useLanguage();

  const currentLang: Locale = locales.includes(locale as Locale) ? locale : 'en';

  function handleLanguageChange(nextLocale: string) {
    const validLocale = locales.includes(nextLocale as Locale)
      ? (nextLocale as Locale)
      : 'en';
    changeLanguage(validLocale);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20">
              <Languages className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            {t('uiLanguage.title')}
          </CardTitle>
          <CardDescription className="text-zinc-500">
            {t('uiLanguage.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              {t('uiLanguage.selectLanguage')}
            </Label>
            <Select value={currentLang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                {UI_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
