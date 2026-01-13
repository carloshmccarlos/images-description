'use client';

import { motion } from 'framer-motion';
import { Camera, Sparkles, Globe, BookOpen, Zap, Shield, Volume2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function FeaturesSection() {
  const t = useTranslations('landing');

  const features = [
    {
      icon: Camera,
      title: t('features.snapLearn'),
      description: t('features.snapLearnDesc'),
      gradient: 'from-sky-500 to-teal-500',
    },
    {
      icon: Sparkles,
      title: t('features.aiPowered'),
      description: t('features.aiPoweredDesc'),
      gradient: 'from-emerald-500 to-sky-500',
    },
    {
      icon: Globe,
      title: t('features.languages'),
      description: t('features.languagesDesc'),
      gradient: 'from-amber-500 to-emerald-500',
    },
    {
      icon: Volume2,
      title: t('features.pronunciation'),
      description: t('features.pronunciationDesc'),
      gradient: 'from-amber-500 to-sky-500',
    },
    {
      icon: BookOpen,
      title: t('features.saveReview'),
      description: t('features.saveReviewDesc'),
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: t('features.trackProgress'),
      description: t('features.trackProgressDesc'),
      gradient: 'from-sky-500 to-amber-500',
    },
    {
      icon: Zap,
      title: t('features.fastEasy'),
      description: t('features.fastEasyDesc'),
      gradient: 'from-emerald-500 to-amber-500',
    },
    {
      icon: Shield,
      title: t('features.freeStart'),
      description: t('features.freeStartDesc'),
      gradient: 'from-teal-500 to-sky-500',
    },
  ];

  return (
    <section id="features" className="relative py-24">
      <div className="absolute inset-0 bg-white dark:bg-zinc-950" />
      <div className="absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[32px_32px] dark:opacity-15" />

      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-end mb-14"
          >
            <div>
              <div className="text-xs font-semibold tracking-[0.28em] uppercase text-zinc-500 dark:text-zinc-400">
                {t('features.sectionLabel')}
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {t('features.title')}
                <br />
                {t('features.titleLine2')}
              </h2>
            </div>
            <div className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300">
              {t('features.description')}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="h-full border border-zinc-200 bg-white/75 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950/40">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center shadow-sm`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                        {t('features.note')}
                      </div>
                    </div>

                    <h3 className="mt-5 font-semibold text-lg tracking-tight text-zinc-900 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {feature.description}
                    </p>

                    <div className="mt-6 h-px w-full bg-linear-to-r from-amber-200 via-emerald-200 to-sky-200 dark:from-amber-500/20 dark:via-emerald-500/15 dark:to-sky-500/15" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
