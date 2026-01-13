import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexilens.app';
  const locales = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko'] as const;
  const protectedRoutes = ['/dashboard/', '/analyze/', '/saved/', '/settings/', '/profile/', '/admin/', '/auth/'] as const;
  const prefixedProtectedRoutes = locales.flatMap((l) => protectedRoutes.map((r) => `/${l}${r}`));
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', ...locales.map((l) => `/${l}`)],
        disallow: [
          '/api/',
          ...protectedRoutes,
          ...prefixedProtectedRoutes,
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
