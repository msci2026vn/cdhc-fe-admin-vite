import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topupAdminApi } from '@/lib/api';
import type { TopupOrderListParams } from '@/types/topup';

// ===== Dashboard =====

export function useTopupStats() {
  return useQuery({
    queryKey: ['topup-stats'],
    queryFn: () => topupAdminApi.getStats(),
    refetchInterval: 30_000,
  });
}

// ===== Orders =====

export function useTopupOrders(params: TopupOrderListParams = {}) {
  return useQuery({
    queryKey: ['topup-orders', params],
    queryFn: () => topupAdminApi.getOrders(params),
  });
}

export function useTopupOrder(orderId: string | null) {
  return useQuery({
    queryKey: ['topup-order', orderId],
    queryFn: () => topupAdminApi.getOrder(orderId!),
    enabled: !!orderId,
  });
}

// ===== Retry Transfer =====

export function useRetryTopupTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => topupAdminApi.retryTransfer(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
      queryClient.invalidateQueries({ queryKey: ['topup-stats'] });
      queryClient.invalidateQueries({ queryKey: ['topup-order'] });
    },
  });
}

// ===== Packages & Price =====

export function useTopupPackages() {
  return useQuery({
    queryKey: ['topup-packages'],
    queryFn: () => topupAdminApi.getPackages(),
    staleTime: 5 * 60_000,
  });
}

export function useAvaxPrice() {
  return useQuery({
    queryKey: ['avax-price'],
    queryFn: () => topupAdminApi.getAvaxPrice(),
    refetchInterval: 60_000,
  });
}

// ===== Hot Wallet =====

export function useHotWalletInfo() {
  return useQuery({
    queryKey: ['admin', 'topup', 'wallet'],
    queryFn: () => topupAdminApi.getWalletInfo(),
    refetchInterval: 60_000,
  });
}

// ===== Transactions =====

export function useTopupTransactions(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'topup', 'transactions', params],
    queryFn: () => topupAdminApi.getTransactions(params),
  });
}
