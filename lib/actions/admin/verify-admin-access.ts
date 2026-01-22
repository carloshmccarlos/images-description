'use server';

import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { db } from '@/lib/db';
import { users, UserRole } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const inputSchema = v.object({});

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

export async function verifyAdminAccess(): Promise<AdminCheckResult> {
  const validated = v.safeParse(inputSchema, {});
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  const user = await getAuthUser();
  if (!user) {
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
