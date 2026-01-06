import { NextResponse } from 'next/server';
import { getSignedDownloadUrl, getKeyFromUrl } from '@/lib/storage/r2-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get('key');
    const urlParam = searchParams.get('url') || '';

    // If a full URL is provided and we can't derive a key, fall back to redirecting it.
    let key: string | null = keyParam;
    if (!key && urlParam) {
      const extracted = getKeyFromUrl(urlParam);
      key = extracted === urlParam ? null : extracted;
    }

    // If we still have no key but have an HTTPS URL, just redirect to it.
    if (!key) {
      if (urlParam.startsWith('http://') || urlParam.startsWith('https://')) {
        return NextResponse.redirect(urlParam);
      }
      return NextResponse.json(
        { error: 'Missing image key or url' },
        { status: 400 }
      );
    }

    // Reject obvious bad keys
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Invalid image key' },
        { status: 400 }
      );
    }

    // Signed URL with short TTL
    const signedUrl = await getSignedDownloadUrl(key, 60);
    const response = NextResponse.redirect(signedUrl);
    response.headers.set('Cache-Control', 'private, max-age=60');
    return response;
  } catch (error) {
    console.error('Error generating signed image URL:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}
