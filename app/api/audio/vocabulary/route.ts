import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as v from 'valibot';
import { locales } from '@/i18n/config';

const EXTERNAL_AUDIO_SERVICE_URL = 'https://vocabulary-audio-service.loveyouall.qzz.io';
const EXTERNAL_AUDIO_KEY = process.env.VOCAB_AUDIO_INTERNAL_KEY;

const InputSchema = v.object({
  word: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  language: v.picklist(locales as unknown as [string, ...string[]]),
});

/**
 * Proxy vocabulary audio with authentication to the external service.
 */
async function validateUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await validateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') ?? '';
    const word = searchParams.get('word') ?? '';

    const parsed = v.safeParse(InputSchema, { language: lang, word });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.issues }, { status: 400 });
    }

    const normalizedWord = parsed.output.word.trim().toLowerCase();
    const normalizedLang = parsed.output.language.toLowerCase();

    // Construct direct URL to the audio file on the CDN
    const audioUrl = `https://mla-audo.loveyouall.qzz.io/${normalizedLang}/${encodeURIComponent(normalizedWord)}.mp3`;
    
    // Fetch and proxy the audio
    const res = await fetch(audioUrl, {
      headers: { 'Accept-Encoding': 'identity' },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(buffer, { status: 200, headers });
  } catch (error) {
    console.error('Error proxying vocabulary audio:', error);
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await validateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!EXTERNAL_AUDIO_KEY) {
      return NextResponse.json({ error: 'Audio service key not configured' }, { status: 503 });
    }

    const body = (await request.json()) as unknown;
    const parsed = v.safeParse(InputSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.issues }, { status: 400 });
    }

    const { word, language } = parsed.output;
    const normalizedWord = word.trim().toLowerCase();
    const normalizedLang = language.toLowerCase();

    // Call external service to generate audio
    const externalRes = await fetch(`${EXTERNAL_AUDIO_SERVICE_URL}/api/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: normalizedLang,
        words: [normalizedWord],
        key: EXTERNAL_AUDIO_KEY,
      }),
    });

    if (!externalRes.ok) {
      const errorData = await externalRes.json().catch(() => ({}));
      console.error('External audio service error:', errorData);
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    const data = await externalRes.json() as { results?: Array<{ word: string; url: string }> };
    const result = data.results?.find(r => r.word === normalizedWord);

    if (!result?.url) {
      return NextResponse.json({ error: 'Audio not generated' }, { status: 500 });
    }

    // Return the proxied URL (so we can cache and control access)
    const audioUrl = `/api/audio/vocabulary?lang=${encodeURIComponent(normalizedLang)}&word=${encodeURIComponent(normalizedWord)}`;

    return NextResponse.json({ audioUrl, directUrl: result.url });
  } catch (error) {
    console.error('Error getting vocabulary audio URL:', error);
    return NextResponse.json({ error: 'Failed to get audio URL' }, { status: 500 });
  }
}
