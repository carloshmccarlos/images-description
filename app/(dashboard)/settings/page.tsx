import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { SettingsHeader } from '@/components/settings/settings-header';
import { UILanguageCard } from '@/components/settings/ui-language-card';
import { LanguageSettingsCard } from '@/components/settings/language-settings-card';
import { AccountSettingsCard } from '@/components/settings/account-settings-card';
import { DangerZoneCard } from '@/components/settings/danger-zone-card';

export default async function SettingsPage() {
  const userResult = await getCurrentUser();

  if (!userResult.success) {
    if (userResult.needsSetup) redirect('/auth/language-setup');
    redirect('/auth/login');
  }

  const user = userResult.data!;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10">
      <SettingsHeader />

      <UILanguageCard />
      
      <LanguageSettingsCard
        motherLanguage={user.motherLanguage}
        learningLanguage={user.learningLanguage}
        proficiencyLevel={user.proficiencyLevel}
      />

      <AccountSettingsCard
        name={user.name || ''}
        email={user.email}
      />

      <DangerZoneCard />
    </div>
  );
}
