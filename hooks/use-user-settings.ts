'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

async function updateUserSettings(payload: Partial<UserSettings>) {
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update settings' }));
    throw new Error(error.error || 'Failed to update settings');
  }

  return response.json();
}

export function useUserSettings(initialData?: UserSettings) {
  return useQuery({
    queryKey: queryKeys.userSettings,
    queryFn: fetchUserSettings,
    initialData,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserSettings,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userSettings });
      const previous = queryClient.getQueryData<UserSettings>(queryKeys.userSettings);

      queryClient.setQueryData<UserSettings>(queryKeys.userSettings, (current) => {
        if (!current) return current;
        return {
          ...current,
          ...payload,
        };
      });

      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.userSettings, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userSettings });
      queryClient.invalidateQueries({ queryKey: queryKeys.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileOverview });
    },
  });
}
