'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

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
  const validated = v.safeParse(v.object({}), {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const user = await getAuthUser();
  if (!user) {
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
      motherLanguage: dbUser.motherLanguage || 'zh-cn',
      learningLanguage: dbUser.learningLanguage || 'en',
      proficiencyLevel: dbUser.proficiencyLevel || 'beginner',
      createdAt: dbUser.createdAt,
    },
  };
}
