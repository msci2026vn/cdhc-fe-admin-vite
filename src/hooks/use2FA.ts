

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminV2Api } from '@/lib/api';

// ============================================
// 2FA Status Hook
// ============================================

export function use2FAStatus() {
  return useQuery({
    queryKey: ['2fa', 'status'],
    queryFn: async () => {
      const response = await adminV2Api.twoFactor.getStatus();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to get 2FA status');
    },
    staleTime: Infinity, // Status không thay đổi thường xuyên
  });
}

// ============================================
// Generate 2FA Secret Hook
// ============================================

export function useGenerate2FA() {
  return useMutation({
    mutationFn: async () => {
      const response = await adminV2Api.twoFactor.generate();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to generate 2FA secret');
    },
  });
}

// ============================================
// Enable 2FA Hook
// ============================================

export function useEnable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await adminV2Api.twoFactor.enable(token);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to enable 2FA');
    },
    onSuccess: () => {
      // Refresh 2FA status sau khi enable
      queryClient.invalidateQueries({ queryKey: ['2fa', 'status'] });
    },
  });
}

// ============================================
// Disable 2FA Hook
// ============================================

export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await adminV2Api.twoFactor.disable(token);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to disable 2FA');
    },
    onSuccess: () => {
      // Refresh 2FA status sau khi disable
      queryClient.invalidateQueries({ queryKey: ['2fa', 'status'] });
    },
  });
}

// ============================================
// Combined 2FA Setup Hook
// ============================================

export function use2FASetup() {
  const status = use2FAStatus();
  const generate = useGenerate2FA();
  const enable = useEnable2FA();
  const disable = useDisable2FA();

  return {
    status,
    generate,
    enable,
    disable,
    isEnabled: status.data?.enabled ?? false,
    isRequired: status.data?.required ?? false,
    isLoading: status.isLoading,
  };
}
