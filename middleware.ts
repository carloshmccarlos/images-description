import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale, type Locale } from './i18n/config';

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return null;
}

function getPreferredLocale(request: NextRequest): Locale {
  // Check cookie first
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languageTags = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().toLowerCase())
      .filter(Boolean);

    for (const tag of languageTags) {
      if (locales.includes(tag as Locale)) {
        return tag as Locale;
      }
      const base = tag.split('-')[0];
      if (base === 'zh') return 'zh-cn';
      const matched = locales.find((l) => l === base || l.startsWith(`${base}-`));
      if (matched) return matched;
    }
  }

  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);
  
  // If no locale in path, redirect to locale-prefixed URL
  if (!localeFromPath) {
    const preferredLocale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set('NEXT_LOCALE', preferredLocale, { path: '/' });
    return response;
  }

  // Rewrite locale-prefixed URL to non-prefixed path for app router
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${localeFromPath}`), '') || '/';
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathnameWithoutLocale;

  // Build request headers with locale info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', localeFromPath);
  requestHeaders.set('x-original-pathname', pathname);

  let response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.cookies.set('NEXT_LOCALE', localeFromPath, { path: '/' });

  // Create Supabase client for auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          response.cookies.set('NEXT_LOCALE', localeFromPath, { path: '/' });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = ['/dashboard', '/analyze', '/saved', '/settings', '/profile', '/admin'];
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

  // Redirect unauthenticated users from protected routes
  if (!user && protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeFromPath}/auth/login`;
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth routes
  if (user && authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeFromPath}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|robots\\.txt|sitemap\\.xml|sitemap/.*\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
