import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [locale, userResult] = await Promise.all([getLocale(), getCurrentUser()]);

  if (!userResult.success) {
    if (userResult.needsSetup) redirect(`/${locale}/auth/setup`);
    redirect(`/${locale}/auth/login`);
  }

  const user = userResult.data!;
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return (
    <DashboardShell
      user={{ email: user.email, name: user.name }}
      isAdmin={isAdmin}
      locale={locale}
    >
      {children}
    </DashboardShell>
  );
}
