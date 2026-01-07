import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/actions/admin/get-admin-users';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') as 'createdAt' | 'lastActivityAt' | 'totalAnalyses' | undefined;
  const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' | undefined;

  const result = await getAdminUsers({
    page,
    limit,
    search,
    sortBy,
    sortDirection,
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
