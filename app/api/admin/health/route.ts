import { NextResponse } from 'next/server';
import { getSystemHealth } from '@/lib/actions/admin/get-system-health';

export async function GET() {
  const result = await getSystemHealth();

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