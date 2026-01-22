import { NextResponse } from 'next/server';
import { getDescriptionAudio } from '@/lib/actions/audio/get-description-audio';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await getDescriptionAudio(body);

    if (!result.success) {
      const status =
        result.error === 'Not authenticated' ? 401
          : result.error === 'Analysis not found' ? 404
            : result.error === 'Description audio feature is disabled' ? 501
              : result.error === 'Audio storage is not configured' ? 501
                : result.error === 'Azure Speech is not configured' ? 501
                  : result.error === 'Azure TTS voice is not configured' ? 501
                    : result.error === 'Unsupported locale' ? 400
                      : result.error === 'No text available' ? 400
                        : 400;

      return NextResponse.json({ error: result.error ?? 'Invalid input' }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error generating description audio:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
