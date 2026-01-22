'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export interface UserSettings {
  id: string;
  email: string;
  name: string | null;
  motherLanguage: string | null;
  learningLanguage: string | null;
  proficiencyLevel: string | null;
}

async function fetchUserSettings(): Promise<UserSettings> {
  const response = await fetch('/api/user/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch user settings');
  }
  return response.json() as Promise<UserSettings>;
}

export function useUserSettings(initialData?: UserSettings) {
  return useQuery({
    queryKey: queryKeys.userSettings,
    queryFn: fetchUserSettings,
    initialData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
