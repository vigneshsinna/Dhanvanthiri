import type { UserRole } from '@/features/auth/store/authSlice';

export function isItUserRole(role?: UserRole | null): boolean {
  return role === 'super_admin';
}

export function getRoleDisplayName(role?: UserRole | null): string {
  if (role === 'super_admin') return 'IT User';
  if (role === 'admin') return 'Admin';
  if (role === 'customer') return 'Customer';
  return 'User';
}
