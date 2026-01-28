'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

interface SessionResponse {
  user: SessionUser | null;
  needsSetup?: boolean;
}

async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch('/api/user/session');

  if (response.status === 401) {
    return { user: null };
  }

  if (response.status === 409) {
    const data = await response.json();
    return { user: null, needsSetup: Boolean(data?.needsSetup) };
  }

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  return response.json() as Promise<SessionResponse>;
}

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: fetchSession,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
