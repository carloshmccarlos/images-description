import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/actions/admin/verify-admin-access';

export async function GET() {
  const result = await verifyAdminAccess();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 403 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}
