import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Familjen_Grotesk, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { I18nProvider } from '@/lib/i18n/provider';
import { getServerLocale } from '@/lib/i18n/server';
import { APP_CONFIG } from '@/lib/constants';

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_CONFIG.name} - Learn Vocabulary Through Images | AI-Powered Language Learning`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: 'Learn vocabulary naturally by uploading photos. Our AI extracts words from images and teaches you in your target language. Support for 20+ languages including Chinese, Japanese, Korean, Spanish, and more.',
  keywords: [
    'vocabulary learning',
    'language learning app',
    'AI language learning',
    'learn vocabulary from images',
    'visual vocabulary',
    'image-based learning',
    'learn Chinese',
    'learn Japanese',
    'learn Korean',
    'learn Spanish',
    'flashcard alternative',
    'vocabulary builder',
    'language learning tool',
    'AI vocabulary extraction',
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
    alternateLocale: ['zh_CN', 'ja_JP', 'ko_KR'],
    url: siteUrl,
    siteName: APP_CONFIG.name,
    title: `${APP_CONFIG.name} - Learn Vocabulary Through Images`,
    description: 'Upload photos and learn vocabulary in your target language. AI-powered visual learning for 20+ languages.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_CONFIG.name} - Learn Vocabulary Through Images`,
    description: 'Upload photos and learn vocabulary in your target language. AI-powered visual learning for 20+ languages.',
    creator: '@lexilens',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en': `${siteUrl}/en`,
      'zh': `${siteUrl}/zh`,
      'ja': `${siteUrl}/ja`,
      'ko': `${siteUrl}/ko`,
    },
  },
  category: 'education',
  classification: 'Language Learning',
};

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
      'Support for 20+ languages',
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
  const locale = await getServerLocale();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <I18nProvider initialLocale={locale}>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
