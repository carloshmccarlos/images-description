import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLocale, getTranslations } from 'next-intl/server';

interface CTASectionProps {
  isLoggedIn: boolean;
}

export async function CTASection({ isLoggedIn }: CTASectionProps) {
  const t = await getTranslations('landing');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_30%,rgba(14,165,233,0.35),transparent_55%),radial-gradient(1100px_circle_at_80%_35%,rgba(16,185,129,0.30),transparent_58%),radial-gradient(1000px_circle_at_55%_90%,rgba(245,158,11,0.22),transparent_55%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[100%_34px]" />

      <div
        className="absolute top-0 left-0 w-[520px] h-[520px] bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[spin_70s_linear_infinite]"
      />
      <div
        className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 motion-safe:animate-[spin_60s_linear_infinite]"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white motion-safe:animate-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 motion-safe:animate-in">
            <Sparkles className="w-10 h-10" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('cta.title')}
            <br />
            {t('cta.titleLine2')}
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            {t('cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isLoggedIn ? `/${locale}/analyze` : `/${locale}/auth/register`}>
              <Button size="lg" className="text-lg px-8 h-14 bg-white text-zinc-900 hover:bg-white/90 shadow-xl">
                {isLoggedIn ? t('cta.ctaLoggedIn') : t('cta.ctaLoggedOut')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {!isLoggedIn && (
              <Link href={`/${locale}/auth/login`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 h-14 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  {tCommon('nav.signIn')}
                </Button>
              </Link>
            )}
          </div>

          <p className="mt-8 text-sm text-white/60">
            {t('cta.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
