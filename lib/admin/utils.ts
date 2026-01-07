import { UserRole } from '@/lib/db/schema';

/**
 * Checks if a role has admin privileges.
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Checks if a role has super admin privileges.
 */
export function isSuperAdminRole(role: UserRole): boolean {
  return role === 'super_admin';
}