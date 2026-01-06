import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkDailyLimit } from '@/lib/usage/daily-limits';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await checkDailyLimit(user.id);
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
