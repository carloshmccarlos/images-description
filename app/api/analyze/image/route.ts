import { NextResponse } from 'next/server';
import { analyzeImageUpload } from '@/lib/actions/analysis/analyze-image';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    const result = await analyzeImageUpload({ file: file as File });

    if (!result.success) {
      if (result.error === 'Not authenticated') {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }

      if (result.error === 'Daily limit reached') {
        return NextResponse.json({ error: result.error, usage: result.usage }, { status: 429 });
      }

      if (result.error === 'You have an ongoing analysis. Please wait for it to complete.') {
        return NextResponse.json(
          { error: result.error, taskId: result.taskId, status: result.taskStatus },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: result.error ?? 'Failed to analyze image' }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
