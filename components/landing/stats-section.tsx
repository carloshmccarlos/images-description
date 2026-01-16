import { getTranslations } from 'next-intl/server';

export async function StatsSection() {
  const t = await getTranslations('landing');

  const stats = [
    { value: '20+', label: t('stats.languagesSupported') },
    { value: '5', label: t('stats.freeDaily') },
    { value: '100%', label: t('stats.aiAccuracy') },
    { value: '24/7', label: t('stats.available') },
  ];

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950" />
      <div className="absolute inset-0 opacity-70 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[28px_28px] dark:opacity-20" />
      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-semibold tracking-[0.28em] uppercase text-zinc-500 dark:text-zinc-400">{t('stats.sectionLabel')}</div>
              <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {t('stats.title')}
              </div>
            </div>
            <div className="hidden md:block text-sm text-zinc-500 dark:text-zinc-400">
              {t('stats.subtitle')}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50 motion-safe:animate-in"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                <span className="bg-linear-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <div className="mt-2 h-px w-full bg-linear-to-r from-amber-200 via-emerald-200 to-sky-200 dark:from-amber-500/20 dark:via-emerald-500/15 dark:to-sky-500/15" />
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
