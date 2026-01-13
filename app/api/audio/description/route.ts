import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as v from 'valibot';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { uploadToR2 } from '@/lib/storage/r2-client';
import { synthesizeSpeech, isAzureTtsConfigured, isAzureTtsVoiceConfigured } from '@/lib/tts/azure-tts';
import { locales, type Locale } from '@/i18n/config';

const InputSchema = v.object({
  analysisId: v.pipe(v.string(), v.uuid()),
  kind: v.picklist(['translated', 'native']),
});

type Input = v.InferInput<typeof InputSchema>;

function isDescriptionAudioEnabled(): boolean {
  return process.env.ENABLE_DESCRIPTION_AUDIO === 'true';
}

function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET_NAME &&
      process.env.CLOUDFLARE_R2_ENDPOINT &&
      process.env.CLOUDFLARE_R2_PUBLIC_URL
  );
}

function generateDescriptionAudioKey(analysisId: string, kind: 'translated' | 'native', locale: string): string {
  const safeLocale = locale.toLowerCase();
  return `descriptions/${analysisId}/${kind}_${safeLocale}.mp3`;
}

export async function POST(request: Request) {
  try {
    // Check feature flag first
    if (!isDescriptionAudioEnabled()) {
      return NextResponse.json({ error: 'Description audio feature is disabled' }, { status: 501 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const parsed = v.safeParse(InputSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.issues }, { status: 400 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: 'Audio storage is not configured' }, { status: 501 });
    }

    if (!isAzureTtsConfigured()) {
      return NextResponse.json({ error: 'Azure Speech is not configured' }, { status: 501 });
    }

    const input: Input = parsed.output;

    const [analysis] = await db
      .select({
        id: savedAnalyses.id,
        userId: savedAnalyses.userId,
        description: savedAnalyses.description,
        descriptionNative: savedAnalyses.descriptionNative,
        learningLanguage: savedAnalyses.learningLanguage,
        motherLanguage: savedAnalyses.motherLanguage,
        descriptionAudioUrl: savedAnalyses.descriptionAudioUrl,
        descriptionNativeAudioUrl: savedAnalyses.descriptionNativeAudioUrl,
      })
      .from(savedAnalyses)
      .where(and(eq(savedAnalyses.id, input.analysisId), eq(savedAnalyses.userId, user.id)));

    if (!analysis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const kind = input.kind;

    if (kind === 'translated' && analysis.descriptionAudioUrl) {
      return NextResponse.json({ audioUrl: analysis.descriptionAudioUrl });
    }

    if (kind === 'native' && analysis.descriptionNativeAudioUrl) {
      return NextResponse.json({ audioUrl: analysis.descriptionNativeAudioUrl });
    }

    const localeRaw = (kind === 'native' ? analysis.motherLanguage : analysis.learningLanguage) ?? 'en';
    const locale = localeRaw.toLowerCase() as Locale;

    if (!locales.includes(locale)) {
      return NextResponse.json({ error: 'Unsupported locale' }, { status: 400 });
    }

    if (!isAzureTtsVoiceConfigured(locale)) {
      return NextResponse.json({ error: 'Azure TTS voice is not configured' }, { status: 501 });
    }

    const text = kind === 'native' ? (analysis.descriptionNative ?? '') : analysis.description;
    if (!text) {
      return NextResponse.json({ error: 'No text available' }, { status: 400 });
    }

    const tts = await synthesizeSpeech({ text, locale });
    const key = generateDescriptionAudioKey(analysis.id, kind, locale);
    const audioUrl = await uploadToR2(tts.audio, key, tts.contentType);

    if (kind === 'native') {
      await db
        .update(savedAnalyses)
        .set({ descriptionNativeAudioUrl: audioUrl })
        .where(eq(savedAnalyses.id, analysis.id));
    } else {
      await db
        .update(savedAnalyses)
        .set({ descriptionAudioUrl: audioUrl })
        .where(eq(savedAnalyses.id, analysis.id));
    }

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Error generating description audio:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
