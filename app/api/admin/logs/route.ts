import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/actions/admin/get-activity-logs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
  const actionType = searchParams.get('actionType') as any || undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  const result = await getActivityLogs({
    page,
    limit,
    actionType,
    dateFrom,
    dateTo,
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
