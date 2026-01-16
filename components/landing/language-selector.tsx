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
import { locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'zh-cn', name: '\u4e2d\u6587\uff08\u7b80\u4f53\uff09', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'zh-tw', name: '\u4e2d\u6587\uff08\u7e41\u9ad4\uff09', flag: '\u{1F1F9}\u{1F1FC}' },
  { code: 'ja', name: '\u65e5\u672c\u8a9e', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'ko', name: '\ud55c\uad6d\uc5b4', flag: '\u{1F1F0}\u{1F1F7}' },
] as const;

export function LanguageSelector() {
  const { locale: currentLang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0],
    [currentLang]
  );

  function handleLanguageChange(locale: string) {
    const validLocale = locales.includes(locale as Locale)
      ? (locale as Locale)
      : 'en';

    changeLanguage(validLocale);
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
