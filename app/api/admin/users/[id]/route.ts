import { NextRequest, NextResponse } from 'next/server';
import { getUserDetail } from '@/lib/actions/admin/get-user-detail';
import { updateUserStatus } from '@/lib/actions/admin/update-user-status';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getUserDetail({ userId: id });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 :
               result.error === 'User not found' ? 404 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const result = await updateUserStatus({
    userId: id,
    action: body.action,
    reason: body.reason,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 :
               result.error === 'User not found' ? 404 :
               result.error === 'Cannot suspend your own account' ? 400 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}
