import { NextResponse } from 'next/server';
import { getUserSettings } from '@/lib/actions/user/get-user-settings';
import { updateUserSettings } from '@/lib/actions/user/update-user-settings';

export async function GET() {
  try {
    const result = await getUserSettings();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to fetch user settings' },
        { status: result.error === 'Not authenticated' ? 401 : 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await updateUserSettings(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Invalid data' },
        { status: result.error === 'Not authenticated' ? 401 : 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
