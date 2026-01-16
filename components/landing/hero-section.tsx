'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/hooks/use-language';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const { locale } = useLanguage();
  const prefixed = `/${locale}`;

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-linear-to-b from-zinc-50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[100%_28px] opacity-70 dark:opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(14,165,233,0.18),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(16,185,129,0.16),transparent_58%),radial-gradient(800px_circle_at_60%_85%,rgba(245,158,11,0.12),transparent_55%)]" />

      <motion.div
        aria-hidden="true"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(15,23,42,0.10)_0,transparent_55%),radial-gradient(circle_at_70%_10%,rgba(3,105,161,0.12)_0,transparent_60%),radial-gradient(circle_at_85%_75%,rgba(4,120,87,0.12)_0,transparent_55%)] bg-size-[140%_140%]"
      />

      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-7xl grid gap-14 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200"
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t('hero.badge')}
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                {t('hero.badgeFree')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 text-5xl leading-[1.03] font-semibold tracking-tight md:text-7xl"
            >
              {t('hero.title').split(' ').slice(0, -2).join(' ')}
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">{t('hero.title').split(' ').slice(-2).join(' ')}</span>
                <span className="absolute -inset-x-2 bottom-1 -z-10 h-[0.55em] -rotate-1 rounded-lg bg-linear-to-r from-amber-300 via-emerald-200 to-sky-200 dark:from-amber-500/30 dark:via-emerald-500/20 dark:to-sky-500/20" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-6 max-w-xl text-lg text-zinc-600 md:text-xl dark:text-zinc-300"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link href={isLoggedIn ? `${prefixed}/dashboard` : `${prefixed}/auth/register`}>
                <Button
                  size="lg"
                  className="h-14 px-7 text-base shadow-lg shadow-emerald-500/10 bg-linear-to-r from-sky-600 via-teal-500 to-emerald-500 hover:from-sky-700 hover:via-teal-600 hover:to-emerald-600"
                >
                  {isLoggedIn ? tCommon('nav.goToDashboard') : t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#demo" className="sm:inline-flex">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-7 text-base border-zinc-300 bg-white/60 hover:bg-white/90 dark:bg-zinc-950/40 dark:border-zinc-700 dark:hover:bg-zinc-950"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {t('hero.ctaHow')}
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400"
            >
              <div className="inline-flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    '\u{1F1EB}\u{1F1F7}',
                    '\u{1F1EE}\u{1F1F9}',
                    '\u{1F1E9}\u{1F1EA}',
                    '\u{1F1EF}\u{1F1F5}',
                    '\u{1F1EA}\u{1F1F8}',
                  ].map((flag, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-900 flex items-center justify-center text-lg border border-zinc-200 dark:border-zinc-800"
                    >
                      {flag}
                    </div>
                  ))}
                </div>
                <span>{t('hero.socialProof')}</span>
              </div>
              <div className="hidden sm:block h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="inline-flex items-center gap-2">
                <span>{t('hero.socialProofDesc')}</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-4xl bg-linear-to-br from-emerald-200/40 via-sky-200/20 to-amber-200/30 blur-2xl dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-amber-500/10" />
            <div className="relative rounded-[1.75rem] border border-zinc-200 bg-white/70 p-4 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between px-2 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">LexiLens - preview</div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <motion.div
                  whileHover={{ rotate: -1.25, y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="col-span-7 rounded-2xl border border-zinc-200 bg-linear-to-br from-amber-50 to-zinc-50 p-4 shadow-sm dark:border-zinc-800 dark:from-amber-500/10 dark:to-zinc-950"
                >
                  <div className="aspect-4/3 rounded-xl bg-[radial-gradient(400px_circle_at_30%_30%,rgba(14,165,233,0.25),transparent_60%),radial-gradient(340px_circle_at_70%_70%,rgba(16,185,129,0.22),transparent_58%)] dark:bg-[radial-gradient(400px_circle_at_30%_30%,rgba(14,165,233,0.22),transparent_60%),radial-gradient(340px_circle_at_70%_70%,rgba(16,185,129,0.18),transparent_58%)] flex items-center justify-center"
                  >
                    <div className="text-5xl">{'\u{1F4F7}'}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {['street', 'market', 'kitchen', 'coffee'].map((tag) => (
                      <div
                        key={tag}
                        className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="col-span-5 space-y-3">
                  {[{ w: 'la manzana', t: 'apple' }, { w: 'el caf\u00e9', t: 'coffee' }, { w: 'la calle', t: 'street' }].map(
                    (item, i) => (
                      <motion.div
                        key={item.w}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.32 + i * 0.08 }}
                        whileHover={{ x: 2 }}
                        className="rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{item.w}</div>
                            <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">/sample/</div>
                          </div>
                          <div className="shrink-0 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                            {item.t}
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
