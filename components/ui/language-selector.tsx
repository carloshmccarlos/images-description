'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, languageNames, languageFlags } from '@/hooks/use-language';
import { locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  variant = 'ghost', 
  size = 'sm',
  showLabel = false,
  className 
}: LanguageSelectorProps) {
  const { locale, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn('gap-2', className)}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {languageFlags[locale]} {languageNames[locale]}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => changeLanguage(lang as Locale)}
            className={cn(
              'cursor-pointer gap-2',
              locale === lang && 'bg-accent'
            )}
          >
            <span>{languageFlags[lang as Locale]}</span>
            <span>{languageNames[lang as Locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Dark theme variant for admin
export function LanguageSelectorDark({ 
  className 
}: { className?: string }) {
  const { locale, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn('gap-2 text-zinc-400 hover:text-white hover:bg-[#2a2a2e]', className)}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languageFlags[locale]} {languageNames[locale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] bg-[#141416] border-[#2a2a2e]">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => changeLanguage(lang as Locale)}
            className={cn(
              'cursor-pointer gap-2 text-zinc-300 hover:text-white focus:text-white focus:bg-[#2a2a2e]',
              locale === lang && 'bg-[#2a2a2e] text-white'
            )}
          >
            <span>{languageFlags[lang as Locale]}</span>
            <span>{languageNames[lang as Locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
