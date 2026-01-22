import { NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/actions/analysis/get-analysis-by-id';
import { deleteSavedAnalysis } from '@/lib/actions/analysis/delete-saved-analysis';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getAnalysisById({ id });

    if (!result.success) {
      const status =
        result.error === 'Not authenticated' ? 401
          : result.error === 'Invalid analysis ID' ? 400
            : 404;
      return NextResponse.json({ error: result.error ?? 'Not found' }, { status });
    }

    return NextResponse.json(result.data);
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
    const { id } = await params;
    const result = await deleteSavedAnalysis({ id });

    if (!result.success) {
      const status =
        result.error === 'Not authenticated' ? 401
          : result.error === 'Invalid analysis ID' ? 400
            : 404;
      return NextResponse.json(
        { error: result.error ?? 'Failed to delete analysis' },
        { status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
