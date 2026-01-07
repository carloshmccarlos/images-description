import { NextRequest, NextResponse } from 'next/server';
import { getModerationContent } from '@/lib/actions/admin/get-moderation-content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  const result = await getModerationContent({
    page,
    limit,
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
