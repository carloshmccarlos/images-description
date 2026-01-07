'use client';

import { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const;

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<SupportedLocale>(
    (i18n.language?.split('-')[0] as SupportedLocale) || 'en'
  );
  const [open, setOpen] = useState(false);

  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0],
    [currentLang]
  );

  function handleLanguageChange(locale: string) {
    const validLocale = SUPPORTED_LOCALES.includes(locale as SupportedLocale)
      ? (locale as SupportedLocale)
      : 'en';

    setCurrentLang(validLocale);
    i18n.changeLanguage(validLocale);

    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', validLocale);
    }
    setOpen(false);
  }

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={currentLanguage.code}
              className="text-base"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {currentLanguage.flag}
            </motion.span>
          </AnimatePresence>
          <Globe className="h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] overflow-hidden p-1"
        sideOffset={8}
      >
        <AnimatePresence>
          <motion.div
            key="lang-list"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2 text-sm',
                  currentLang === lang.code
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold'
                    : ''
                )}
              >
                <span>{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
