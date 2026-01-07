import { NextRequest, NextResponse } from 'next/server';
import { flagContent } from '@/lib/actions/admin/flag-content';
import { deleteContent } from '@/lib/actions/admin/delete-content';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const result = await flagContent({
    analysisId: id,
    reason: body.reason,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 :
               result.error === 'Analysis not found' ? 404 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await deleteContent({
    analysisId: id,
    reason: body.reason,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 :
               result.error === 'Analysis not found' ? 404 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}
