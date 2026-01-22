'use client';

import { SettingsHeader } from '@/components/settings/settings-header';
import { UILanguageCard } from '@/components/settings/ui-language-card';
import { LanguageSettingsCard } from '@/components/settings/language-settings-card';
import { AccountSettingsCard } from '@/components/settings/account-settings-card';
import { DangerZoneCard } from '@/components/settings/danger-zone-card';
import { useUserSettings, type UserSettings } from '@/hooks/use-user-settings';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SettingsClientProps {
  initialSettings: UserSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const { data, isLoading } = useUserSettings(initialSettings);
  const settings = data ?? initialSettings;

  if (isLoading && !data) {
    return (
      <div className="max-w-screen-2xl mx-auto space-y-10">
        <SettingsHeader />
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10">
      <SettingsHeader />

      <UILanguageCard />
      
      <LanguageSettingsCard
        motherLanguage={settings.motherLanguage ?? 'zh-cn'}
        learningLanguage={settings.learningLanguage ?? 'en'}
        proficiencyLevel={settings.proficiencyLevel ?? 'beginner'}
      />

      <AccountSettingsCard
        name={settings.name || ''}
        email={settings.email}
      />

      <DangerZoneCard />
    </div>
  );
}
