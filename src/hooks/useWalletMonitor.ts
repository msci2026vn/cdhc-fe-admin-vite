import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { walletMonitorApi } from '@/lib/api';

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletMonitorApi.getAll(),
    refetchInterval: 60_000,
  });
}

export function useWalletTransactions(walletId: string | null, page = 1) {
  return useQuery({
    queryKey: ['wallet-transactions', walletId, page],
    queryFn: () => walletMonitorApi.getTransactions(walletId!, page),
    enabled: !!walletId,
  });
}

export function useBalanceHistory(walletId?: string, days = 7) {
  return useQuery({
    queryKey: ['wallet-balance-history', walletId, days],
    queryFn: () => walletMonitorApi.getBalanceHistory(walletId, days),
  });
}

export function useCheckWallets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => walletMonitorApi.checkNow(),
    onSuccess: () => {
      toast.success('Da cap nhat balance vi');
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance-history'] });
    },
    onError: (err: Error) => {
      toast.error(`Loi: ${err.message}`);
    },
  });
}
