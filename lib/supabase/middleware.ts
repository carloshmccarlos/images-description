import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { defaultLocale, locales, type Locale } from '@/i18n/config';

const LOCALE_PREFIXES = locales;
type LocalePrefix = Locale;

function parseLocalePrefix(pathname: string): { locale: LocalePrefix | null; pathnameWithoutLocale: string } {
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (first && (LOCALE_PREFIXES as readonly string[]).includes(first)) {
    const rest = `/${parts.slice(1).join('/')}`;
    return { locale: first as LocalePrefix, pathnameWithoutLocale: rest === '/' ? '/' : rest };
  }
  return { locale: null, pathnameWithoutLocale: pathname };
}

function withLocalePrefix(pathname: string, locale: LocalePrefix | null): string {
  if (!locale) return pathname;
  const target = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/${locale}${target === '/' ? '' : target}`;
}

function getPreferredLocale(request: NextRequest): LocalePrefix {
  // Check cookie first
  const cookieLocale = request.cookies.get('locale')?.value?.toLowerCase();
  if (cookieLocale && (LOCALE_PREFIXES as readonly string[]).includes(cookieLocale as LocalePrefix)) {
    return cookieLocale as LocalePrefix;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languageTags = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().toLowerCase())
      .filter(Boolean);

    for (const tag of languageTags) {
      if ((LOCALE_PREFIXES as readonly string[]).includes(tag as LocalePrefix)) {
        return tag as LocalePrefix;
      }
      // Check base language (e.g., 'zh' -> 'zh-cn')
      const base = tag.split('-')[0];
      if (base === 'zh') return 'zh-cn';
      const matched = LOCALE_PREFIXES.find((l) => l === base || l.startsWith(`${base}-`));
      if (matched) return matched;
    }
  }

  return defaultLocale;
}

export async function updateSession(request: NextRequest) {
  const { locale, pathnameWithoutLocale } = parseLocalePrefix(request.nextUrl.pathname);
  
  // Skip locale handling for API routes
  if (request.nextUrl.pathname.startsWith('/api/') || pathnameWithoutLocale.startsWith('/api/')) {
    // For API routes, just pass through without locale handling
    let supabaseResponse = NextResponse.next();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next();
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.getUser();
    return supabaseResponse;
  }
  
  // Redirect to locale-prefixed URL if no locale in path
  if (!locale) {
    const preferredLocale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix(pathnameWithoutLocale, preferredLocale);
    const response = NextResponse.redirect(url);
    response.cookies.set('locale', preferredLocale, { path: '/' });
    return response;
  }

  const rewriteUrl = (() => {
    const url = request.nextUrl.clone();
    url.pathname = pathnameWithoutLocale;
    return url;
  })();

  const buildRequestHeaders = () => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-original-pathname', request.nextUrl.pathname);
    requestHeaders.set('x-locale', locale);
    return requestHeaders;
  };

  const createResponse = () => {
    const requestHeaders = buildRequestHeaders();
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  };

  let supabaseResponse = createResponse();
  supabaseResponse.cookies.set('locale', locale, { path: '/' });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = createResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          supabaseResponse.cookies.set('locale', locale, { path: '/' });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = ['/dashboard', '/analyze', '/saved', '/settings', '/profile'];
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const pathname = pathnameWithoutLocale;

  // Redirect unauthenticated users from protected routes
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix('/auth/login', locale);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth routes
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix('/dashboard', locale);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
