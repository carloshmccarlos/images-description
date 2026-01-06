import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, desc, ilike, or, sql, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!query.trim()) {
      return NextResponse.json({ analyses: [], page, limit });
    }

    const searchPattern = `%${query}%`;

    const analyses = await db
      .select()
      .from(savedAnalyses)
      .where(
        and(
          eq(savedAnalyses.userId, user.id),
          or(
            ilike(savedAnalyses.description, searchPattern),
            sql`${savedAnalyses.vocabulary}::text ILIKE ${searchPattern}`
          )
        )
      )
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ analyses, page, limit, query });
  } catch (error) {
    console.error('Error searching analyses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
