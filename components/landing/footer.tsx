'use client';

import Link from 'next/link';
import { Sparkles, Github, Twitter } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('landing');

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">{APP_CONFIG.name}</span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.features')}</a></li>
              <li><a href="#demo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.howItWorks')}</a></li>
              <li><Link href="/auth/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.getStarted')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} {APP_CONFIG.name}. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
