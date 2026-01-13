import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Sparkles, Check } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';
import { APP_CONFIG } from '@/lib/constants';
export const metadata: Metadata = {
  title: 'Create Account - Start Learning Free',
  description: 'Create your free LexiLens account and start learning vocabulary through images. No credit card required.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RegisterPage() {
  const locale = await getLocale();
  const t = await getTranslations('auth');

  const benefits = [
    t('register.benefits.freeAnalyses'),
    t('register.benefits.aiPowered'),
    t('register.benefits.saveReview'),
    t('register.benefits.trackProgress'),
    t('register.benefits.languages'),
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Background Texture */}
      <div className="pointer-events-none fixed inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[36px_36px] dark:opacity-15" />

      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-zinc-900">
        {/* Editorial Background */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-900 via-zinc-900 to-sky-900 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        {/* Floating Shapes */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white max-w-2xl">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-sky-400">
              {t('register.newJourney')}
            </div>
            <h2 className="text-5xl font-bold leading-[1.1] tracking-tight">
              {t('register.decorativeTitle')}
              <br />
              <span className="text-sky-400">{t('register.decorativeTitleHighlight')}</span>
            </h2>
            <p className="text-zinc-400 text-xl leading-relaxed">
              {t('register.decorativeDesc')}
            </p>
            
            <ul className="space-y-5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-zinc-300 font-medium text-lg group-hover:text-white transition-colors">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-12 left-16 right-16 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href={`/${locale}`} className="flex items-center gap-3 mb-10 group">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">{APP_CONFIG.name}</span>
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">{t('register.title')}</h1>
            <p className="text-zinc-500 text-lg">
              {t('register.subtitle')}
            </p>
          </div>

          <div className="p-1 rounded-3xl bg-white/40 backdrop-blur-sm border border-zinc-200 shadow-xl shadow-zinc-200/50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:shadow-none">
            <div className="p-6">
              <RegisterForm />
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-zinc-500">
            {t('register.hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-emerald-600 hover:text-emerald-500 font-bold underline underline-offset-4 decoration-emerald-500/30">
              {t('register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
