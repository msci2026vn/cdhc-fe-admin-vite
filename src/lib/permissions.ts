import type { UserRole } from '@/types';

export const PERMISSIONS: Record<string, string[]> = {
  super_admin: ['all'],
  admin: [
    'users.view',
    'users.approve',
    'users.reject',
    'users.suspend',
    'users.activate',
    'users.delete',
    'stats.view',
    'notes.manage',
    'notifications.send',
    'logs.view_own',
  ],
  editor: ['users.view', 'stats.view', 'logs.view_own'],
};

export function canAccess(role: UserRole | string, permission: string): boolean {
  if (role === 'super_admin') return true;
  const permissions = PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function isAdminRole(role: string): boolean {
  return ['super_admin', 'admin', 'editor'].includes(role);
}

export function canManageStaff(role: string): boolean {
  return role === 'super_admin';
}

export function canExport(role: string): boolean {
  return role === 'super_admin';
}

export function canBroadcast(role: string): boolean {
  return role === 'super_admin';
}
