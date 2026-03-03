import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { marketplaceAdminApi } from '@/lib/api';

export function useMarketplaceStats() {
  return useQuery({
    queryKey: ['marketplace-admin', 'stats'],
    queryFn: () => marketplaceAdminApi.getStats(),
    refetchInterval: 30_000,
  });
}

export function useMarketplaceListings(status?: string) {
  return useQuery({
    queryKey: ['marketplace-admin', 'listings', status],
    queryFn: () => marketplaceAdminApi.getListings(status),
  });
}

export function useMarketplaceWithdrawals() {
  return useQuery({
    queryKey: ['marketplace-admin', 'withdrawals'],
    queryFn: () => marketplaceAdminApi.getWithdrawals(),
  });
}

export function useForceCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketplaceAdminApi.forceCancel(id),
    onSuccess: () => {
      toast.success('Đã hủy listing');
      queryClient.invalidateQueries({ queryKey: ['marketplace-admin'] });
    },
    onError: (err: Error) => {
      toast.error(`Hủy thất bại: ${err.message}`);
    },
  });
}
