import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedUploadUrl, generateImageKey } from '@/lib/storage/r2-client';
import { IMAGE_CONFIG } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    if (!IMAGE_CONFIG.supportedTypes.includes(contentType as typeof IMAGE_CONFIG.supportedTypes[number])) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    const key = generateImageKey(user.id, filename);
    const uploadUrl = await getSignedUploadUrl(key, contentType);
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
