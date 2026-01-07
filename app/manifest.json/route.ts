import { NextResponse } from 'next/server';

export function GET() {
  const manifest = {
    name: 'LexiLens - Learn Vocabulary Through Images',
    short_name: 'LexiLens',
    description:
      'Upload photos and learn vocabulary in your target language. AI-powered visual learning for 20+ languages.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['education', 'productivity'],
    lang: 'en',
    dir: 'ltr',
  };

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
