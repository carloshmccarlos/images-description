import { NextResponse } from 'next/server';
import { checkDailyLimit } from '@/lib/actions/usage/check-daily-limit';

export async function GET() {
  try {
    const result = await checkDailyLimit({});

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Unauthorized' },
        { status: result.error === 'Not authenticated' ? 401 : 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
