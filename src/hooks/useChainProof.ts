import { useQuery } from '@tanstack/react-query';
import { chainProofApi } from '@/lib/api';
import type { ChainProofStats, ChainProofList } from '@/lib/api';

export type { ChainProofStats, ChainProofList };

export function useChainProofStats() {
  return useQuery({
    queryKey: ['chain-proof', 'stats'],
    queryFn: () => chainProofApi.getStats(),
    refetchInterval: 30_000,
  });
}

export function useChainProofList(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['chain-proof', 'list', page, limit],
    queryFn: () => chainProofApi.getList(page, limit),
  });
}
