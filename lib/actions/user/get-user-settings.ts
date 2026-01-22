'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const inputSchema = v.object({});

interface UserSettings {
  id: string;
  email: string;
  name: string | null;
  motherLanguage: string | null;
  learningLanguage: string | null;
  proficiencyLevel: string | null;
}

interface GetUserSettingsResult {
  success: boolean;
  data?: UserSettings;
  error?: string;
}

export async function getUserSettings(): Promise<GetUserSettingsResult> {
  const validated = v.safeParse(inputSchema, {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));

  if (!dbUser) {
    return { success: false, error: 'User not found' };
  }

  return {
    success: true,
    data: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? null,
      motherLanguage: dbUser.motherLanguage ?? null,
      learningLanguage: dbUser.learningLanguage ?? null,
      proficiencyLevel: dbUser.proficiencyLevel ?? null,
    },
  };
}
