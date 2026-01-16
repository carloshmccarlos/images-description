import Link from 'next/link';
import { Github, Twitter, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { getLocale, getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('landing');
  const locale = await getLocale();

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">{APP_CONFIG.name}</span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-base">{t('footer.product')}</h3>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.features')}</a></li>
              <li><a href="#demo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.howItWorks')}</a></li>
              <li><Link href={`/${locale}/auth/register`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.getStarted')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-base">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>
                <a
                  href="mailto:image-description@loveyouall.qzz.io"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  image-description@loveyouall.qzz.io
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} {APP_CONFIG.name}. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com/lexilens" 
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label={t('footer.followOnTwitter')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="w-5 h-5" aria-hidden="true" />
            </a>
            <a 
              href="https://github.com/lexilens" 
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label={t('footer.viewOnGithub')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
