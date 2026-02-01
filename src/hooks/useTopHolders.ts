import { useQuery } from '@tanstack/react-query';
import { adminV2Api, AssetTotalsData, TopHoldersListData, RankDistributionData, ConcentrationData, HolderDetailData } from '@/lib/api';

/**
 * Hook to get asset totals
 * Lấy tổng hợp tài sản
 */
export function useAssetTotals() {
  return useQuery({
    queryKey: ['top-holders-totals'],
    queryFn: async (): Promise<AssetTotalsData> => {
      const response = await adminV2Api.topHolders.getTotals();
      if (response.success && response.data) {
        return response.data as AssetTotalsData;
      }
      throw new Error('Failed to fetch asset totals');
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    retry: 3,
  });
}

/**
 * Hook to get top holders list
 * Lấy danh sách top holders
 */
export function useTopHoldersList(
  limit = 100,
  sortBy: 'shares' | 'ogn' | 'tor' | 'total' = 'total'
) {
  return useQuery({
    queryKey: ['top-holders-list', limit, sortBy],
    queryFn: async (): Promise<TopHoldersListData> => {
      const response = await adminV2Api.topHolders.getList(limit, sortBy);
      console.log('[useTopHoldersList] Raw response:', response);

      if (response.success && response.data) {
        const data = response.data;
        console.log('[useTopHoldersList] Unwrapped data:', data);

        // Handle case: data is array directly (backend returns array)
        if (Array.isArray(data)) {
          console.log('[useTopHoldersList] Data is array, wrapping...');
          return { holders: data, count: data.length };
        }

        // Handle case: data has holders property
        if (data.holders) {
          console.log('[useTopHoldersList] Data has holders property');
          return data as TopHoldersListData;
        }

        // Fallback: wrap unknown structure
        console.log('[useTopHoldersList] Unknown structure, returning as-is');
        return data as TopHoldersListData;
      }
      throw new Error('Failed to fetch top holders list');
    },
    retry: 3,
  });
}

/**
 * Hook to get distribution by rank
 * Lấy phân phối theo cấp bậc
 */
export function useDistribution() {
  return useQuery({
    queryKey: ['top-holders-distribution'],
    queryFn: async (): Promise<RankDistributionData[]> => {
      const response = await adminV2Api.topHolders.getDistribution();
      if (response.success && response.data) {
        return response.data as RankDistributionData[];
      }
      throw new Error('Failed to fetch distribution');
    },
    refetchInterval: 300000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook to get concentration metrics
 * Lấy chỉ số tập trung
 */
export function useConcentration() {
  return useQuery({
    queryKey: ['top-holders-concentration'],
    queryFn: async (): Promise<ConcentrationData> => {
      const response = await adminV2Api.topHolders.getConcentration();
      if (response.success && response.data) {
        return response.data as ConcentrationData;
      }
      throw new Error('Failed to fetch concentration metrics');
    },
    refetchInterval: 300000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook to search holders
 * Tìm kiếm holders
 */
export function useSearchHolders(query: string) {
  return useQuery({
    queryKey: ['top-holders-search', query],
    queryFn: async (): Promise<TopHoldersListData | null> => {
      if (!query || query.length < 2) return null;
      const response = await adminV2Api.topHolders.search(query);
      if (response.success && response.data) {
        const data = response.data;

        // Handle case: data is array directly
        if (Array.isArray(data)) {
          return { holders: data, count: data.length };
        }

        // Handle case: data has holders property
        if (data.holders) {
          return data as TopHoldersListData;
        }

        return data as TopHoldersListData;
      }
      throw new Error('Failed to search holders');
    },
    enabled: query.length >= 2,
    retry: 2,
  });
}

/**
 * Hook to get holder detail
 * Lấy chi tiết một holder
 */
export function useHolderDetail(userId: string) {
  return useQuery({
    queryKey: ['holder-detail', userId],
    queryFn: async (): Promise<HolderDetailData> => {
      const response = await adminV2Api.topHolders.getHolder(userId);
      if (response.success && response.data) {
        return response.data as HolderDetailData;
      }
      throw new Error('Failed to fetch holder detail');
    },
    enabled: !!userId,
    retry: 2,
  });
}
