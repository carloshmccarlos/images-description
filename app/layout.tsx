import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Familjen_Grotesk, Geist_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { I18nProvider } from '@/i18n/provider';
import { APP_CONFIG } from '@/lib/constants';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

const displayFont = Bodoni_Moda({
  variable: '--font-display',
  subsets: ['latin'],
});

const bodyFont = Familjen_Grotesk({
  variable: '--font-body',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexilens.app';

function getBcp47Locale(locale: Locale): string {
  if (locale === 'zh-cn') return 'zh-CN';
  if (locale === 'zh-tw') return 'zh-TW';
  return locale;
}

function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (first && locales.includes(first as Locale)) {
    const rest = `/${parts.slice(1).join('/')}`;
    return rest === '/' ? '/' : rest;
  }
  return pathname;
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const originalPathname = headersList.get('x-original-pathname') ?? '/';
  const localeHeader = (headersList.get('x-locale') ?? '').toLowerCase();

  const isPrefixed = locales.some((l) => originalPathname.toLowerCase().startsWith(`/${l}`));
  const canonicalLocale = (isPrefixed
    ? (localeHeader as Locale)
    : defaultLocale) || defaultLocale;

  const suffix = stripLocalePrefix(originalPathname);
  const canonicalPathname = `/${canonicalLocale}${suffix === '/' ? '' : suffix}`;
  const canonical = `${siteUrl}${canonicalPathname}`;

  const languages = Object.fromEntries([
    ...locales.map((l) => [getBcp47Locale(l), `${siteUrl}/${l}${suffix === '/' ? '' : suffix}`]),
    ['x-default', `${siteUrl}/${defaultLocale}${suffix === '/' ? '' : suffix}`],
  ]);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${APP_CONFIG.name} - Learn Vocabulary Through Images | AI-Powered Language Learning`,
      template: `%s | ${APP_CONFIG.name}`,
    },
    description: 'Learn vocabulary naturally by uploading photos. Our AI extracts words from images and teaches you in your target language. Support for English, Chinese (Simplified/Traditional), Japanese, and Korean.',
    keywords: [
      'vocabulary learning',
      'language learning app',
      'AI language learning',
      'best ai language learning tools',
      'learn vocabulary from images',
      'visual vocabulary',
      'image-based learning',
      'learn Chinese',
      'learn Japanese',
      'learn Korean',
      'flashcard alternative',
      'vocabulary builder',
      'language learning tool',
      'AI vocabulary extraction',
      'photo vocabulary',
      'photo vocabulary',
    ],
    authors: [{ name: 'LexiLens Team' }],
    creator: 'LexiLens',
    publisher: 'LexiLens',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['zh_CN', 'zh_TW', 'ja_JP', 'ko_KR'],
      url: canonical,
      siteName: APP_CONFIG.name,
      title: `${APP_CONFIG.name} - Learn Vocabulary Through Images`,
      description: 'Upload photos and learn vocabulary in your target language. AI-powered visual learning for English, Chinese (Simplified/Traditional), Japanese, and Korean.',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${APP_CONFIG.name} - Learn Vocabulary Through Images`,
      description: 'Upload photos and learn vocabulary in your target language. AI-powered visual learning for English, Chinese (Simplified/Traditional), Japanese, and Korean.',
      creator: '@lexilens',
    },
    alternates: {
      canonical,
      languages,
    },
    category: 'education',
    classification: 'Language Learning',
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

// JSON-LD structured data
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: APP_CONFIG.name,
    description: 'Learn vocabulary naturally by uploading photos. AI-powered visual language learning.',
    url: siteUrl,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: '10 free image analyses per day',
    },
    featureList: [
      'AI-powered vocabulary extraction from images',
      'Support for English, Chinese (Simplified/Traditional), Japanese, and Korean',
      'Save and review vocabulary',
      'Track learning progress',
      'Visual learning approach',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <I18nProvider locale={locale} messages={messages as Record<string, unknown>}>
            <QueryProvider>
              {children}
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
