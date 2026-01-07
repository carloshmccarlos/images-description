'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, UserRole } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface AdminCheckResult {
  success: boolean;
  data?: AdminUser;
  error?: string;
}

/**
 * Verifies that the current user has admin or super_admin role.
 * Returns the admin user data if authorized, or an error if not.
 */
export async function verifyAdminAccess(): Promise<AdminCheckResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const [dbUser] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, user.id));

  if (!dbUser) {
    return { success: false, error: 'User not found' };
  }

  if (dbUser.status === 'suspended') {
    return { success: false, error: 'Account suspended' };
  }

  if (dbUser.role !== 'admin' && dbUser.role !== 'super_admin') {
    return { success: false, error: 'Admin access required' };
  }

  return {
    success: true,
    data: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    },
  };
}
