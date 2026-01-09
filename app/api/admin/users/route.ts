import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/actions/admin/get-admin-users';
import { createUser } from '@/lib/actions/admin/create-user';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await createUser({
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
                 result.error?.includes('already exists') ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
