import { MetadataRoute } from 'next';
import { locales, type Locale } from '@/i18n/config';

function buildLanguageAlternates(siteUrl: string, pathname: string) {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const suffix = normalizedPathname === '/' ? '' : normalizedPathname;

  return Object.fromEntries([
    ...locales.map((l) => [
      l === 'en' ? 'en' : l === 'ja' ? 'ja' : l === 'ko' ? 'ko' : l === 'zh-cn' ? 'zh-CN' : 'zh-TW',
      `${siteUrl}/${l}${suffix}`,
    ]),
    ['x-default', `${siteUrl}/en${suffix}`],
  ]);
}

export async function generateSitemaps() {
  return locales.map((locale) => ({ id: locale }));
}

export default function sitemap({ id }: { id: Locale }): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexilens.app';
  const currentDate = new Date();

  const alternates = buildLanguageAlternates(siteUrl, '/');

  return [
    {
      url: `${siteUrl}/${id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: alternates,
      },
    },
  ];
}
