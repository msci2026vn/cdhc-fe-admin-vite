import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionAdminApi } from '@/lib/api';
import type { AuctionSession, AuctionQueueItem, CreateSessionInput } from '@/lib/api';

const keys = {
  sessions: ['auction-admin', 'sessions'] as const,
  queue: (status?: string) => ['auction-admin', 'queue', status] as const,
  suggestions: ['auction-admin', 'suggestions'] as const,
  stats: ['auction-admin', 'stats'] as const,
};

export function useAdminSessions() {
  return useQuery({
    queryKey: keys.sessions,
    queryFn: async () => {
      const res = await auctionAdminApi.getSessions();
      return (res.data?.data ?? []) as AuctionSession[];
    },
  });
}

export function useAdminQueue(status?: string) {
  return useQuery({
    queryKey: keys.queue(status),
    queryFn: async () => {
      const res = await auctionAdminApi.getQueue(status);
      return (res.data?.data ?? []) as AuctionQueueItem[];
    },
  });
}

export function useSpotlightSuggestions() {
  return useQuery({
    queryKey: keys.suggestions,
    queryFn: async () => {
      const res = await auctionAdminApi.getSuggestions();
      return res.data?.data ?? null;
    },
    enabled: false,
  });
}

export function useAuctionStats() {
  return useQuery({
    queryKey: keys.stats,
    queryFn: async () => {
      const res = await auctionAdminApi.getStats();
      return (res.data?.data ?? {}) as Record<string, number>;
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSessionInput) => auctionAdminApi.createSession(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auction-admin'] });
      toast.success('Da tao phien dau gia');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auctionAdminApi.cancelSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auction-admin'] });
      toast.success('Da huy phien');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAssignSpotlights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, queueIds }: { sessionId: string; queueIds: string[] }) =>
      auctionAdminApi.assignSpotlights(sessionId, queueIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auction-admin'] });
      toast.success('Da gan spotlight');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAssignSides() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => auctionAdminApi.assignSides(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auction-admin'] });
      toast.success('Da gan phien phu');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDetailedStats() {
  return useQuery({
    queryKey: [...keys.stats, 'detailed'],
    queryFn: async () => {
      const res = await auctionAdminApi.getDetailedStats();
      return (res.data?.data ?? {}) as Record<string, number | string>;
    },
  });
}

export function useAuctionsBySession(sessionId: string | null) {
  return useQuery({
    queryKey: ['auction-admin', 'auctions', sessionId],
    queryFn: async () => {
      const res = await auctionAdminApi.getAuctionsBySession(sessionId!);
      return (res.data?.data ?? []) as any[];
    },
    enabled: !!sessionId,
  });
}

export function useAuctionDetailAdmin(auctionId: string | null) {
  return useQuery({
    queryKey: ['auction-admin', 'detail', auctionId],
    queryFn: async () => {
      const res = await auctionAdminApi.getAuctionDetail(auctionId!);
      return (res.data?.data ?? null) as any;
    },
    enabled: !!auctionId,
  });
}

export function useActivateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => auctionAdminApi.activateSession(sessionId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auction-admin'] });
      const created = data.data?.auctionsCreated ?? 0;
      toast.success(`Session activated! ${created} auctions created`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
