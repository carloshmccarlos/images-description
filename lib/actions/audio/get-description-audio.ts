'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { savedAnalyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { uploadToR2 } from '@/lib/storage/r2-client';
import { synthesizeSpeech, isAzureTtsConfigured, isAzureTtsVoiceConfigured } from '@/lib/tts/azure-tts';
import { locales, type Locale } from '@/i18n/config';
import * as v from 'valibot';

const inputSchema = v.object({
  analysisId: v.pipe(v.string(), v.uuid()),
  kind: v.picklist(['translated', 'native']),
});

interface GetDescriptionAudioResult {
  success: boolean;
  data?: { audioUrl: string };
  error?: string;
}

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

export async function getDescriptionAudio(
  input: unknown
): Promise<GetDescriptionAudioResult> {
  if (!isDescriptionAudioEnabled()) {
    return { success: false, error: 'Description audio feature is disabled' };
  }

  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const parsed = v.safeParse(inputSchema, input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  if (!isR2Configured()) {
    return { success: false, error: 'Audio storage is not configured' };
  }

  if (!isAzureTtsConfigured()) {
    return { success: false, error: 'Azure Speech is not configured' };
  }

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
    .where(and(eq(savedAnalyses.id, parsed.output.analysisId), eq(savedAnalyses.userId, user.id)));

  if (!analysis) {
    return { success: false, error: 'Analysis not found' };
  }

  const kind = parsed.output.kind;
  if (kind === 'translated' && analysis.descriptionAudioUrl) {
    return { success: true, data: { audioUrl: analysis.descriptionAudioUrl } };
  }

  if (kind === 'native' && analysis.descriptionNativeAudioUrl) {
    return { success: true, data: { audioUrl: analysis.descriptionNativeAudioUrl } };
  }

  const localeRaw = (kind === 'native' ? analysis.motherLanguage : analysis.learningLanguage) ?? 'en';
  const locale = localeRaw.toLowerCase() as Locale;

  if (!locales.includes(locale)) {
    return { success: false, error: 'Unsupported locale' };
  }

  if (!isAzureTtsVoiceConfigured(locale)) {
    return { success: false, error: 'Azure TTS voice is not configured' };
  }

  const text = kind === 'native' ? (analysis.descriptionNative ?? '') : analysis.description;
  if (!text) {
    return { success: false, error: 'No text available' };
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

  return { success: true, data: { audioUrl } };
}
