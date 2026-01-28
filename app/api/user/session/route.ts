import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/user/get-current-user';

export async function GET() {
  try {
    const result = await getCurrentUser();

    if (!result.success) {
      if (result.needsSetup) {
        return NextResponse.json(
          { user: null, needsSetup: true },
          { status: 409 }
        );
      }

      if (result.error === 'Not authenticated') {
        return NextResponse.json({ user: null }, { status: 401 });
      }

      return NextResponse.json(
        { error: result.error ?? 'Failed to fetch session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: result.data });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
