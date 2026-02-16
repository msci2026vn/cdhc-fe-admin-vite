import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminV2Api } from '@/lib/api';
import type { EmailChangesListParams } from '@/lib/api';

export function useEmailChangesStats() {
  return useQuery({
    queryKey: ['email-changes-stats'],
    queryFn: () => adminV2Api.emailChanges.getStats(),
  });
}

export function useEmailChangesList(params: EmailChangesListParams = {}) {
  return useQuery({
    queryKey: ['email-changes', params],
    queryFn: () => adminV2Api.emailChanges.getList(params),
  });
}

export function useEmailChangeDetail(id: number | null) {
  return useQuery({
    queryKey: ['email-change-detail', id],
    queryFn: () => adminV2Api.emailChanges.getDetail(id!),
    enabled: id !== null,
  });
}

export function useLockedAttempts() {
  return useQuery({
    queryKey: ['locked-attempts'],
    queryFn: () => adminV2Api.emailChanges.getLockedAttempts(),
  });
}

export function useDisputeEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminV2Api.emailChanges.dispute(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-changes'] });
      queryClient.invalidateQueries({ queryKey: ['email-change-detail'] });
      queryClient.invalidateQueries({ queryKey: ['email-changes-stats'] });
    },
  });
}

export function useCancelEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      adminV2Api.emailChanges.cancel(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-changes'] });
      queryClient.invalidateQueries({ queryKey: ['email-change-detail'] });
      queryClient.invalidateQueries({ queryKey: ['email-changes-stats'] });
    },
  });
}

export function useUnlockPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => adminV2Api.emailChanges.unlock(phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locked-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['email-changes-stats'] });
    },
  });
}
