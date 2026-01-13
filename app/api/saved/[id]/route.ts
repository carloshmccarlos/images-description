import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFromR2, getKeyFromUrl } from '@/lib/storage/r2-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [analysis] = await db
      .select()
      .from(savedAnalyses)
      .where(and(eq(savedAnalyses.id, id), eq(savedAnalyses.userId, user.id)));

    if (!analysis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [analysis] = await db
      .select()
      .from(savedAnalyses)
      .where(and(eq(savedAnalyses.id, id), eq(savedAnalyses.userId, user.id)));

    if (!analysis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete media from R2 (image + description audios if present)
    const mediaUrls = [
      analysis.imageUrl,
      analysis.descriptionAudioUrl,
      analysis.descriptionNativeAudioUrl,
    ].filter(Boolean) as string[];

    for (const url of mediaUrls) {
      try {
        const key = getKeyFromUrl(url);
        await deleteFromR2(key);
      } catch (e) {
        console.error('Failed to delete media from R2:', e);
      }
    }

    // Delete from database
    await db
      .delete(savedAnalyses)
      .where(eq(savedAnalyses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
