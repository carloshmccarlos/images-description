'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DemoSection() {
  const { t } = useTranslation('landing');

  const steps = [
    {
      step: 1,
      icon: Upload,
      title: t('demo.step1Title'),
      description: t('demo.step1Desc'),
      gradient: 'from-sky-500 to-teal-500',
    },
    {
      step: 2,
      icon: Brain,
      title: t('demo.step2Title'),
      description: t('demo.step2Desc'),
      gradient: 'from-emerald-500 to-sky-500',
    },
    {
      step: 3,
      icon: BookOpen,
      title: t('demo.step3Title'),
      description: t('demo.step3Desc'),
      gradient: 'from-amber-500 to-emerald-500',
    },
  ];

  return (
    <section id="demo" className="relative py-24">
      <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950" />
      <div className="absolute inset-0 opacity-70 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-size-[100%_30px] dark:opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_18%_22%,rgba(14,165,233,0.14),transparent_55%),radial-gradient(900px_circle_at_82%_24%,rgba(16,185,129,0.12),transparent_58%),radial-gradient(900px_circle_at_60%_85%,rgba(245,158,11,0.10),transparent_55%)]" />

      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-10 lg:grid-cols-[1fr_1fr] items-end mb-14"
          >
            <div>
              <div className="text-xs font-semibold tracking-[0.28em] uppercase text-zinc-500 dark:text-zinc-400">
                {t('demo.sectionLabel')}
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {t('demo.title')}
                <br />
                {t('demo.titleLine2')}
              </h2>
            </div>
            <div className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300">
              {t('demo.description')}
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-linear-to-r from-sky-300 via-emerald-300 to-amber-300 dark:from-sky-500/25 dark:via-emerald-500/20 dark:to-amber-500/20" />

              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.18 }}
                  className="relative"
                >
                  <div className="h-full rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/45">
                    <div className="flex items-start justify-between gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${step.gradient} flex items-center justify-center shadow-sm`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                        {t('demo.step')} {step.step}
                      </div>
                    </div>

                    <h3 className="mt-5 font-semibold text-lg tracking-tight text-zinc-900 dark:text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {step.description}
                    </p>

                    <div className="mt-6 h-px w-full bg-linear-to-r from-amber-200 via-emerald-200 to-sky-200 dark:from-amber-500/20 dark:via-emerald-500/15 dark:to-sky-500/15" />
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute top-8 -right-3 z-20">
                      <ArrowRight className="w-7 h-7 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Demo preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="bg-zinc-100/70 dark:bg-zinc-900/60 px-4 py-3 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-sm text-zinc-500 ml-2">LexiLens — Analyze</span>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Image preview */}
                  <div className="space-y-4">
                    <div className="aspect-video bg-linear-to-br from-amber-50 via-white to-sky-50 dark:from-amber-500/10 dark:via-zinc-950 dark:to-sky-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div className="text-6xl">🍎🍊🍋</div>
                    </div>
                    <div className="p-4 bg-white/80 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        <span className="font-semibold text-zinc-900 dark:text-white">{t('demo.aiDescription')}</span> {t('demo.sampleDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Vocabulary cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-white">{t('demo.vocabulary')}</h4>
                      <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">{t('demo.sample')}</span>
                    </div>
                    {[
                      { word: 'manzana', translation: 'apple', pronunciation: '/man-ˈθa-na/' },
                      { word: 'naranja', translation: 'orange', pronunciation: '/na-ˈɾan-xa/' },
                      { word: 'limón', translation: 'lemon', pronunciation: '/li-ˈmon/' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.word}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="p-4 bg-white/80 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-lg text-zinc-900 dark:text-white">{item.word}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.pronunciation}</p>
                          </div>
                          <p className="text-sm font-semibold bg-linear-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            {item.translation}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
