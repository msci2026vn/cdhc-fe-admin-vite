import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryAdminApi } from '@/lib/api';
import type { CreateBatchRequest } from '@/types/delivery';

// ===== Claimed Slots =====

export function useAdminClaimedSlots(monthYear?: string) {
  return useQuery({
    queryKey: ['admin-claimed-slots', monthYear],
    queryFn: () => deliveryAdminApi.getClaimedSlots(monthYear),
  });
}

// ===== Create Batch =====

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatchRequest) => deliveryAdminApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-claimed-slots'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-batches'] });
    },
  });
}

// ===== Generate PDF =====

export function useGeneratePdf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => deliveryAdminApi.generatePdf(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-batches'] });
    },
  });
}

// ===== Batch History =====

export function useDeliveryBatches(limit = 20) {
  return useQuery({
    queryKey: ['delivery-batches', limit],
    queryFn: () => deliveryAdminApi.getBatches(limit),
  });
}
