import { locales, type Locale } from '@/i18n/config';

export function isAzureTtsConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

export function isAzureTtsVoiceConfigured(locale: Locale): boolean {
  return Boolean(getVoiceForLocale(locale));
}

function getVoiceForLocale(locale: Locale): string | null {
  const normalized = locale.toLowerCase() as Locale;

  if (normalized === 'en') return process.env.AZURE_TTS_VOICE_EN ?? null;
  if (normalized === 'ja') return process.env.AZURE_TTS_VOICE_JA ?? null;
  if (normalized === 'ko') return process.env.AZURE_TTS_VOICE_KO ?? null;
  if (normalized === 'zh-cn') return process.env.AZURE_TTS_VOICE_ZH_CN ?? null;
  if (normalized === 'zh-tw') return process.env.AZURE_TTS_VOICE_ZH_TW ?? null;

  return null;
}

function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function getAzureAccessToken(): Promise<string> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    throw new Error('Azure Speech is not configured');
  }

  const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to get Azure Speech token');
  }

  return res.text();
}

export interface AzureTtsInput {
  text: string;
  locale: Locale;
}

export interface AzureTtsResult {
  audio: Buffer;
  contentType: 'audio/mpeg';
  voice: string;
}

export async function synthesizeSpeech({ text, locale }: AzureTtsInput): Promise<AzureTtsResult> {
  const normalizedLocale = locale.toLowerCase() as Locale;
  if (!locales.includes(normalizedLocale)) {
    throw new Error('Unsupported locale');
  }

  const region = process.env.AZURE_SPEECH_REGION;
  if (!region) throw new Error('Azure Speech is not configured');

  const voice = getVoiceForLocale(normalizedLocale);
  if (!voice) {
    throw new Error('Azure TTS voice is not configured');
  }

  const token = await getAzureAccessToken();

  const ssml = `<?xml version="1.0" encoding="utf-8"?>
<speak version="1.0" xml:lang="${normalizedLocale}" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts">
  <voice name="${voice}">${escapeXml(text)}</voice>
</speak>`;

  const ttsRes = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'image-description',
    },
    body: ssml,
  });

  if (!ttsRes.ok) {
    throw new Error('Azure TTS synthesis failed');
  }

  const arrayBuffer = await ttsRes.arrayBuffer();
  return { audio: Buffer.from(arrayBuffer), contentType: 'audio/mpeg', voice };
}
