import { NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/actions/admin/get-platform-stats';

export async function GET() {
  const result = await getPlatformStats();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Not authenticated' ? 401 : 
               result.error === 'Admin access required' ? 403 : 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  });
}
