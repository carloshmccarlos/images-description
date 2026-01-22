'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { languagePreferencesSchema } from '@/lib/validations/user';

interface UpdateUserSettingsResult {
  success: boolean;
  error?: string;
}

export async function updateUserSettings(
  input: v.InferInput<typeof languagePreferencesSchema>
): Promise<UpdateUserSettingsResult> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validated = v.safeParse(languagePreferencesSchema, input);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { motherLanguage, learningLanguage, proficiencyLevel } = validated.output;

  const [existingUser] = await db.select().from(users).where(eq(users.id, user.id));

  if (!existingUser) {
    if (!user.email) {
      return { success: false, error: 'User email not available' };
    }

    await db.insert(users).values({
      id: user.id,
      email: user.email,
      motherLanguage,
      learningLanguage,
      proficiencyLevel,
    });
  } else {
    await db
      .update(users)
      .set({
        motherLanguage,
        learningLanguage,
        proficiencyLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  return { success: true };
}
