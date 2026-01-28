const AUDIO_CACHE_NAME = 'lexilens-audio-v1';
const inFlight = new Map<string, Promise<void>>();

function isAudioCacheSupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

async function openAudioCache(): Promise<Cache | null> {
  if (!isAudioCacheSupported()) return null;
  return caches.open(AUDIO_CACHE_NAME);
}

export async function ensureAudioCached(audioUrl: string): Promise<void> {
  if (!audioUrl) return;
  const cache = await openAudioCache();
  if (!cache) return;

  const existing = await cache.match(audioUrl);
  if (existing) return;

  const inFlightTask = inFlight.get(audioUrl);
  if (inFlightTask) {
    await inFlightTask;
    return;
  }

  const task = (async () => {
    try {
      const response = await fetch(audioUrl, { credentials: 'include' });
      if (!response.ok) return;

      const contentType = response.headers.get('Content-Type') ?? '';
      if (!contentType.includes('audio')) return;

      await cache.put(audioUrl, response.clone());
    } catch {
      // Ignore cache errors to avoid blocking playback.
    }
  })();

  inFlight.set(audioUrl, task);

  try {
    await task;
  } finally {
    inFlight.delete(audioUrl);
  }
}

export async function getCachedAudioObjectUrl(audioUrl: string): Promise<string | null> {
  if (!audioUrl) return null;
  const cache = await openAudioCache();
  if (!cache) return null;

  const cachedResponse = await cache.match(audioUrl);
  if (!cachedResponse) return null;

  const blob = await cachedResponse.blob();
  return URL.createObjectURL(blob);
}
