'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from './language-selector';
import { Skeleton } from '@/components/ui/skeleton';

interface NavbarProps {
  locale: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  dashboardHref: string;
}

export function Navbar({ locale, isLoggedIn, isLoading, dashboardHref }: NavbarProps) {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      data-testid="landing-header"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">{APP_CONFIG.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              {t('navbar.features')}
            </a>
            <a href="#demo" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              {t('navbar.howItWorks')}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
              </div>
            ) : isLoggedIn ? (
              <Link href={dashboardHref}>
                <Button>{tCommon('nav.goToDashboard')}</Button>
              </Link>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="ghost">{tCommon('nav.signIn')}</Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button className="bg-linear-to-r from-sky-600 via-teal-500 to-emerald-500 hover:from-sky-700 hover:via-teal-600 hover:to-emerald-600">
                    {tCommon('nav.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 px-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-lg rounded-2xl mt-2"
          >
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                {t('navbar.features')}
              </a>
              <a href="#demo" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                {t('navbar.howItWorks')}
              </a>
              <div className="pt-2">
                <LanguageSelector />
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ) : isLoggedIn ? (
                  <Link href={dashboardHref}>
                    <Button className="w-full">{tCommon('nav.goToDashboard')}</Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/${locale}/auth/login`}>
                      <Button variant="outline" className="w-full">{tCommon('nav.signIn')}</Button>
                    </Link>
                    <Link href={`/${locale}/auth/register`}>
                      <Button className="w-full">{tCommon('nav.getStarted')}</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
