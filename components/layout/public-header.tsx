'use client';

import { useLanguage } from '@/hooks/use-language';
import { useSession } from '@/hooks/use-session';
import { Navbar } from '@/components/landing/navbar';

export function PublicHeader() {
  const { locale } = useLanguage();
  const { data: sessionData, isLoading } = useSession();
  const needsSetup = Boolean(sessionData?.needsSetup);
  const isLoggedIn = Boolean(sessionData?.user) || needsSetup;
  const dashboardHref = needsSetup ? `/${locale}/auth/setup` : `/${locale}/dashboard`;

  return (
    <Navbar
      locale={locale}
      isLoggedIn={isLoggedIn}
      isLoading={isLoading}
      dashboardHref={dashboardHref}
    />
  );
}
