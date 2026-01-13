import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { APP_CONFIG } from '@/lib/constants';
export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to LexiLens to continue your language learning journey. Access your saved vocabulary, track progress, and analyze new images.',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function LoginPage() {
  const locale = await getLocale();
  const t = await getTranslations('auth');

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Background Texture */}
      <div className="pointer-events-none fixed inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[36px_36px] dark:opacity-15" />

      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href={`/${locale}`} className="flex items-center gap-3 mb-10 group">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">{APP_CONFIG.name}</span>
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">{t('login.title')}</h1>
            <p className="text-zinc-500 text-lg">
              {t('login.subtitle')}
            </p>
          </div>

          <div className="p-1 rounded-3xl bg-white/40 backdrop-blur-sm border border-zinc-200 shadow-xl shadow-zinc-200/50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:shadow-none">
            <div className="p-6">
              <LoginForm />
              {/* Mobile: register link directly under login button */}
              <p className="mt-4 text-center text-sm font-medium text-zinc-500 md:hidden">
                {t('login.noAccount')}{' '}
                <Link href={`/${locale}/auth/register`} className="text-emerald-600 hover:text-emerald-500 font-bold underline underline-offset-4 decoration-emerald-500/30">
                  {t('login.signUpFree')}
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-zinc-500 hidden md:block">
            {t('login.noAccount')}{' '}
            <Link href={`/${locale}/auth/register`} className="text-emerald-600 hover:text-emerald-500 font-bold underline underline-offset-4 decoration-emerald-500/30">
              {t('login.signUpFree')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-zinc-900">
        {/* Editorial Background */}
        <div className="absolute inset-0 bg-linear-to-br from-sky-900 via-zinc-900 to-emerald-900 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white max-w-2xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-emerald-400">
              {t('login.visualLearning')}
            </div>
            <h2 className="text-5xl font-bold leading-[1.1] tracking-tight">
              {t('login.decorativeTitle')}
              <br />
              <span className="text-emerald-400">{t('login.decorativeTitleHighlight')}</span>
            </h2>
            <p className="text-zinc-400 text-xl leading-relaxed">
              {t('login.decorativeDesc')}
            </p>
            
            <div className="pt-8 flex items-center gap-6">
              <div className="flex -space-x-3">
                {['🇺🇸', '🇨🇳', '🇹🇼', '🇯🇵', '🇰🇷'].map((flag, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl border border-white/20 shadow-xl"
                  >
                    {flag}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold">{t('login.languagesSupported')}</p>
                <p className="text-zinc-500 text-sm font-medium">{t('login.supportedGlobally')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-12 left-16 right-16 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}
