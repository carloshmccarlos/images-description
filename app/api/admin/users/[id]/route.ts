import { NextRequest, NextResponse } from 'next/server';
import { getUserDetail } from '@/lib/actions/admin/get-user-detail';
import { updateUserStatus } from '@/lib/actions/admin/update-user-status';
import { updateUser } from '@/lib/actions/admin/update-user';
import { deleteUser } from '@/lib/actions/admin/delete-user';
import { updateUserLimit } from '@/lib/actions/admin/update-user-limit';

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

  // If action is provided, use updateUserStatus (for suspend/reactivate)
  if (body.action) {
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

  // If dailyLimit is provided, update user limit
  if (body.dailyLimit !== undefined) {
    const result = await updateUserLimit({
      userId: id,
      dailyLimit: body.dailyLimit,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Not authenticated' ? 401 : 
                 result.error === 'Admin access required' ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  }

  // Otherwise, use updateUser for general updates
  const result = await updateUser({
    userId: id,
    email: body.email,
    name: body.name,
    role: body.role,
    status: body.status,
    motherLanguage: body.motherLanguage,
    learningLanguage: body.learningLanguage,
    proficiencyLevel: body.proficiencyLevel,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 :
               result.error === 'User not found' ? 404 :
               result.error?.includes('already in use') ? 409 : 400 }
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
  
  let reason: string | undefined;
  try {
    const body = await request.json();
    reason = body.reason;
  } catch {
    // No body provided, that's fine
  }

  const result = await deleteUser({
    userId: id,
    reason,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 :
               result.error === 'User not found' ? 404 :
               result.error === 'Cannot delete your own account' ? 400 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}
