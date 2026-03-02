import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { worldBossApi } from '@/lib/api';
import type { AdminCreateBossPayload } from '@/types/world-boss';

export function useWorldBossCurrent() {
  return useQuery({
    queryKey: ['world-boss', 'current'],
    queryFn: () => worldBossApi.getCurrent(),
    refetchInterval: 5_000,
  });
}

export function useWorldBossHistory(limit = 20) {
  return useQuery({
    queryKey: ['world-boss', 'history', limit],
    queryFn: () => worldBossApi.getHistory(limit),
  });
}

export function useWorldBossLeaderboard(eventId: string | null) {
  return useQuery({
    queryKey: ['world-boss', 'leaderboard', eventId],
    queryFn: () => worldBossApi.getLeaderboard(eventId!),
    enabled: !!eventId,
  });
}

export function useAdminCreateBoss() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCreateBossPayload) => worldBossApi.adminCreate(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['world-boss'] });
      const bossName = data.data?.boss?.bossName;
      toast.success(
        bossName ? `Boss "${bossName}" đã được tạo thành công!` : 'Boss đã được tạo thành công!',
      );
    },
    onError: (err: Error) => {
      toast.error('Tạo boss thất bại: ' + err.message);
    },
  });
}

export function useAdminEndBoss() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      reason,
    }: {
      eventId: string;
      reason?: 'defeated' | 'expired' | 'manual';
    }) => worldBossApi.adminEnd(eventId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['world-boss'] });
      if (data.success && data.data) {
        toast.success(
          `Boss kết thúc: ${data.data.totalParticipants} người chơi, ${data.data.rewardsDistributed} phần thưởng`,
        );
      } else if (data.success) {
        toast.success('Boss đã kết thúc!');
      }
    },
    onError: (err: Error) => {
      toast.error('Kết thúc boss thất bại: ' + err.message);
    },
  });
}

export function useAdminBossDetail(eventId: string | null) {
  return useQuery({
    queryKey: ['world-boss', 'detail', eventId],
    queryFn: async () => {
      const res = await worldBossApi.getAdminDetail(eventId!);
      return res.data!.data;
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}
