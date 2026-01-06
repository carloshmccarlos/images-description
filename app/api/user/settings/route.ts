import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { languagePreferencesSchema } from '@/lib/validations/user';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      motherLanguage: dbUser.motherLanguage,
      learningLanguage: dbUser.learningLanguage,
      proficiencyLevel: dbUser.proficiencyLevel,
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = languagePreferencesSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { motherLanguage, learningLanguage, proficiencyLevel } = validatedData.data;

    // Check if user exists, if not create them
    const [existingUser] = await db.select().from(users).where(eq(users.id, user.id));

    if (!existingUser) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
