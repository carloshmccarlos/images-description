'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  user: { email: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const { t } = useTranslation('landing');
  const { t: tCommon } = useTranslation('common');
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
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
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
            {user ? (
              <Link href="/dashboard">
                <Button>{tCommon('nav.goToDashboard')}</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">{tCommon('nav.signIn')}</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-linear-to-r from-sky-600 via-teal-500 to-emerald-500 hover:from-sky-700 hover:via-teal-600 hover:to-emerald-600">
                    {tCommon('nav.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                {t('navbar.features')}
              </a>
              <a href="#demo" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                {t('navbar.howItWorks')}
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                {user ? (
                  <Link href="/dashboard">
                    <Button className="w-full">{tCommon('nav.goToDashboard')}</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">{tCommon('nav.signIn')}</Button>
                    </Link>
                    <Link href="/auth/register">
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
