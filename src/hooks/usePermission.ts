

import { useAuthStore } from '@/stores/authStore';
import { canAccess, canManageStaff, canExport, canBroadcast } from '@/lib/permissions';

export function usePermission() {
  const { admin } = useAuthStore();
  const role = admin?.role || '';

  return {
    canAccess: (permission: string) => canAccess(role, permission),
    canManageStaff: () => canManageStaff(role),
    canExport: () => canExport(role),
    canBroadcast: () => canBroadcast(role),
    isSuperAdmin: () => role === 'super_admin',
    isAdmin: () => role === 'admin',
    isEditor: () => role === 'editor',
    role,
  };
}
