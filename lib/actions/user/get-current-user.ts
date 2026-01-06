'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  createdAt: Date;
}

interface GetCurrentUserResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
  needsSetup?: boolean;
}

export async function getCurrentUser(): Promise<GetCurrentUserResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  if (!dbUser) {
    return { success: false, needsSetup: true, error: 'User profile not found' };
  }

  return {
    success: true,
    data: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      motherLanguage: dbUser.motherLanguage || 'en',
      learningLanguage: dbUser.learningLanguage || 'es',
      proficiencyLevel: dbUser.proficiencyLevel || 'beginner',
      createdAt: dbUser.createdAt,
    },
  };
}
