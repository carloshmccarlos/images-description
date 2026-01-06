'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SettingsHeader() {
  const { t } = useTranslation('settings');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-zinc-600 to-zinc-800 flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-black/20">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('header.title')}</h1>
          <p className="text-zinc-500 mt-1">
            {t('header.subtitle')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
