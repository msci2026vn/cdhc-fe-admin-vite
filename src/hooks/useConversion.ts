import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversionAdminApi } from '@/lib/api';
import type {
  ConversionListParams,
  ConversionAlertParams,
  FailedAttemptsParams,
} from '@/types/conversion';

// ===== Dashboard =====

export function useConversionStats() {
  return useQuery({
    queryKey: ['conversion-stats'],
    queryFn: () => conversionAdminApi.getStats(),
    refetchInterval: 30_000,
  });
}

export function useConversionLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ['conversion-leaderboard', limit],
    queryFn: () => conversionAdminApi.getLeaderboard(limit),
  });
}

// ===== Transactions =====

export function useConversionList(params: ConversionListParams = {}) {
  return useQuery({
    queryKey: ['conversion-list', params],
    queryFn: () => conversionAdminApi.getList(params),
  });
}

// ===== User Audit =====

export function useUserAudit(userId: string | null, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['conversion-user-audit', userId, page, limit],
    queryFn: () => conversionAdminApi.getUserAudit(userId!, page, limit),
    enabled: !!userId,
  });
}

// ===== Freeze / Unfreeze =====

export function useFreezeUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetUserId, reason }: { targetUserId: string; reason: string }) =>
      conversionAdminApi.freezeUser(targetUserId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-user-audit'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

export function useUnfreezeUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetUserId, reason }: { targetUserId: string; reason: string }) =>
      conversionAdminApi.unfreezeUser(targetUserId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-user-audit'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

export function useFreezeSystem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => conversionAdminApi.freezeSystem(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

export function useUnfreezeSystem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => conversionAdminApi.unfreezeSystem(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

// ===== Alerts =====

export function useConversionAlerts(params: ConversionAlertParams = {}) {
  return useQuery({
    queryKey: ['conversion-alerts', params],
    queryFn: () => conversionAdminApi.getAlerts(params),
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, note }: { alertId: string; note: string }) =>
      conversionAdminApi.dismissAlert(alertId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

export function useEscalateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, note }: { alertId: string; note: string }) =>
      conversionAdminApi.escalateAlert(alertId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

export function useRunAlertScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversionAdminApi.runAlertScan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['conversion-admin-logs'] });
    },
  });
}

// ===== Failed Attempts =====

export function useFailedAttempts(params: FailedAttemptsParams = {}) {
  return useQuery({
    queryKey: ['conversion-failed-attempts', params],
    queryFn: () => conversionAdminApi.getFailedAttempts(params),
  });
}

// ===== Admin Logs =====

export function useConversionAdminLogs(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['conversion-admin-logs', page, limit],
    queryFn: () => conversionAdminApi.getAdminLogs(page, limit),
  });
}
