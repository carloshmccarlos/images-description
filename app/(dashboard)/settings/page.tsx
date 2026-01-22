import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { SettingsClient } from '@/components/settings/settings-client';
export default async function SettingsPage() {
  const [locale, userResult] = await Promise.all([getLocale(), getCurrentUser()]);

  if (!userResult.success) {
    if (userResult.needsSetup) redirect(`/${locale}/auth/setup`);
    redirect(`/${locale}/auth/login`);
  }

  return (
    <SettingsClient
      initialSettings={{
        id: userResult.data!.id,
        email: userResult.data!.email,
        name: userResult.data!.name,
        motherLanguage: userResult.data!.motherLanguage,
        learningLanguage: userResult.data!.learningLanguage,
        proficiencyLevel: userResult.data!.proficiencyLevel,
      }}
    />
  );
}
