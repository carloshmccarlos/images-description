'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

interface CheckUserSetupResult {
  success: boolean;
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  userId?: string;
  userEmail?: string;
  error?: string;
}

export async function checkUserSetup(): Promise<CheckUserSetupResult> {
  const validated = v.safeParse(v.object({}), {});
  if (!validated.success) {
    return { 
      success: false, 
      isAuthenticated: false, 
      isSetupComplete: false,
      error: 'Invalid input',
    };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { 
      success: true, 
      isAuthenticated: false, 
      isSetupComplete: false 
    };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  const isSetupComplete = !!(dbUser?.learningLanguage && dbUser?.motherLanguage);

  return {
    success: true,
    isAuthenticated: true,
    isSetupComplete,
    userId: user.id,
    userEmail: user.email || '',
  };
}
