import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const LOCALES = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko'] as const;

function withLocalePrefix(pathname: string, locale: string | null): string {
  const normalizedLocale = (locale ?? '').toLowerCase();
  if (!normalizedLocale || !(LOCALES as readonly string[]).includes(normalizedLocale)) return pathname;

  const target = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const parts = target.split('/').filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return target;
  }

  return `/${normalizedLocale}${target === '/' ? '' : target}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value ?? null;
  const nextWithLocale = withLocalePrefix(next, cookieLocale);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${nextWithLocale}`);
    }
  }

  return NextResponse.redirect(`${origin}${withLocalePrefix('/auth/login', cookieLocale)}?error=Could not authenticate`);
}
