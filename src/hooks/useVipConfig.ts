import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { vipConfigApi } from '@/lib/api';

export function useVipConfigs() {
  return useQuery({
    queryKey: ['vip-config'],
    queryFn: () => vipConfigApi.getAll(),
  });
}

export function useUpdateVipConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tier, deliveriesPerDay }: { tier: string; deliveriesPerDay: number }) =>
      vipConfigApi.update(tier, deliveriesPerDay),
    onSuccess: () => {
      toast.success('Đã lưu cấu hình VIP');
      queryClient.invalidateQueries({ queryKey: ['vip-config'] });
    },
    onError: (err: Error) => {
      toast.error(`Lỗi: ${err.message}`);
    },
  });
}
