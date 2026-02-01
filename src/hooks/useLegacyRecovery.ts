import { useQuery } from '@tanstack/react-query';
import { adminV2Api, RecoveryStatsData, RecoverySummaryData, LegacyMembersData, LegacyMemberData } from '@/lib/api';

/**
 * Hook to get recovery statistics
 * Lấy thống kê khôi phục
 */
export function useRecoveryStats() {
  return useQuery({
    queryKey: ['legacy-recovery-stats'],
    queryFn: async (): Promise<RecoveryStatsData> => {
      const response = await adminV2Api.legacyRecovery.getStats();
      console.log('[useRecoveryStats] Raw response:', response);
      console.log('[useRecoveryStats] response.data:', response.data);

      if (response.success && response.data) {
        const stats = response.data as RecoveryStatsData;
        console.log('[useRecoveryStats] Stats:', {
          total: stats.total,
          restored: stats.restored,
          notRestored: stats.notRestored,
          recoveryRate: stats.recoveryRate,
        });
        return stats;
      }
      throw new Error('Failed to fetch recovery stats');
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    retry: 3,
  });
}

/**
 * Hook to get detailed summary
 * Lấy tóm tắt chi tiết
 */
export function useRecoverySummary() {
  return useQuery({
    queryKey: ['legacy-recovery-summary'],
    queryFn: async (): Promise<RecoverySummaryData> => {
      const response = await adminV2Api.legacyRecovery.getSummary();
      if (response.success && response.data) {
        return response.data as RecoverySummaryData;
      }
      throw new Error('Failed to fetch recovery summary');
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 3,
  });
}

/**
 * Hook to get restored members list
 * Lấy danh sách thành viên đã khôi phục
 */
export function useRestoredMembers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['legacy-recovery-restored', page, limit],
    queryFn: async (): Promise<LegacyMembersData> => {
      const response = await adminV2Api.legacyRecovery.getRestored(page, limit);
      if (response.success && response.data) {
        return response.data as LegacyMembersData;
      }
      throw new Error('Failed to fetch restored members');
    },
    retry: 3,
  });
}

/**
 * Hook to get not restored members list
 * Lấy danh sách thành viên chưa khôi phục
 */
export function useNotRestoredMembers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['legacy-recovery-not-restored', page, limit],
    queryFn: async (): Promise<LegacyMembersData> => {
      const response = await adminV2Api.legacyRecovery.getNotRestored(page, limit);
      if (response.success && response.data) {
        return response.data as LegacyMembersData;
      }
      throw new Error('Failed to fetch not restored members');
    },
    retry: 3,
  });
}

/**
 * Hook to search members
 * Tìm kiếm thành viên
 */
export function useSearchMembers(query: string) {
  return useQuery({
    queryKey: ['legacy-recovery-search', query],
    queryFn: async (): Promise<LegacyMembersData | null> => {
      if (!query || query.length < 2) return null;
      const response = await adminV2Api.legacyRecovery.search(query);
      if (response.success && response.data) {
        return response.data as LegacyMembersData;
      }
      throw new Error('Failed to search members');
    },
    enabled: query.length >= 2,
    retry: 2,
  });
}

/**
 * Hook to get single member by email
 * Lấy thông tin một thành viên theo email
 */
export function useLegacyMember(email: string) {
  return useQuery({
    queryKey: ['legacy-recovery-member', email],
    queryFn: async (): Promise<LegacyMemberData> => {
      const response = await adminV2Api.legacyRecovery.getMember(email);
      if (response.success && response.data) {
        return response.data as LegacyMemberData;
      }
      throw new Error('Failed to fetch member');
    },
    enabled: !!email,
    retry: 2,
  });
}
