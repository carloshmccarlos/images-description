'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export function StatsSection() {
  const t = useTranslations('landing');

  const stats = [
    { value: 20, suffix: '+', label: t('stats.languagesSupported') },
    { value: 5, suffix: '', label: t('stats.freeDaily') },
    { value: 100, suffix: '%', label: t('stats.aiAccuracy') },
    { value: 24, suffix: '/7', label: t('stats.available') },
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
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                <span className="bg-linear-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </span>
              </div>
              <div className="mt-2 h-px w-full bg-linear-to-r from-amber-200 via-emerald-200 to-sky-200 dark:from-amber-500/20 dark:via-emerald-500/15 dark:to-sky-500/15" />
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
