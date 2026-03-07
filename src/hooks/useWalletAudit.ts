import { useQuery } from '@tanstack/react-query';
import { walletAuditApi } from '@/lib/api';

export function useWalletAuditSummary(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['wallet-audit-summary', page, limit],
    queryFn: async () => {
      const res = await walletAuditApi.getSummary(page, limit);
      return res.data ?? null;
    },
    refetchInterval: 60_000,
  });
}

export function useWalletAuditDetail(walletId: string | null) {
  return useQuery({
    queryKey: ['wallet-audit-detail', walletId],
    queryFn: async () => {
      const res = await walletAuditApi.getDetail(walletId!);
      return res.data ?? null;
    },
    enabled: !!walletId,
  });
}
