import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses, userStats } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const saveAnalysisSchema = z.object({
  imageUrl: z.string().url(),
  description: z.string().min(1),
  vocabulary: z.array(z.object({
    word: z.string(),
    translation: z.string(),
    pronunciation: z.string(),
    exampleSentence: z.string(),
    category: z.string().optional(),
  })),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const analyses = await db
      .select()
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, user.id))
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ analyses, page, limit });
  } catch (error) {
    console.error('Error fetching saved analyses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = saveAnalysisSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { imageUrl, description, vocabulary } = validatedData.data;

    const [saved] = await db
      .insert(savedAnalyses)
      .values({
        userId: user.id,
        imageUrl,
        description,
        vocabulary,
      })
      .returning();

    // Update words learned count
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id));
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalWordsLearned: stats.totalWordsLearned + vocabulary.length,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, user.id));
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
