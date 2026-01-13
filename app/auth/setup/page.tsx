import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import { checkUserSetup } from '@/lib/actions/user/check-user-setup';
import { LanguageSetupForm } from '@/components/auth/language-setup-form';
import { APP_CONFIG } from '@/lib/constants';
export default async function LanguageSetupPage() {
  const result = await checkUserSetup();
  const locale = await getLocale();
  const t = await getTranslations('auth');

  if (!result.isAuthenticated) {
    redirect(`/${locale}/auth/login`);
  }

  if (result.isSetupComplete) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 relative overflow-hidden">
      {/* Background Texture */}
      <div className="pointer-events-none fixed inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[36px_36px] dark:opacity-15" />
      
      {/* Decorative Radials */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-sky-600 to-emerald-500 shadow-xl shadow-emerald-500/20 mb-8 animate-in zoom-in duration-500">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">{t('setup.title').replace('LexiLens', APP_CONFIG.name)}</h1>
          <p className="text-zinc-500 text-lg leading-relaxed max-w-md mx-auto">
            {t('setup.subtitle')}
          </p>
        </div>

        <div className="p-1 rounded-3xl bg-white/40 backdrop-blur-sm border border-zinc-200 shadow-2xl shadow-zinc-200/50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:shadow-none">
          <div className="p-8">
            <LanguageSetupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
