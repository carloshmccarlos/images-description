'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(queryKeys.session, { user: null });
        return;
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.session });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return <>{children}</>;
}
