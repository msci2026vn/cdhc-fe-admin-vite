import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, userEmailApi } from '@/lib/api';
import type { User, UserProfile, UserFilters, BulkActionResult } from '@/types';

export function useUsers(filters: UserFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.get<User[]>(`/api/admin/users?${params.toString()}`),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get<User>(`/api/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ['user-profile', id],
    queryFn: () =>
      api.get<{ user: User; profile: UserProfile['profile'] }>(`/api/admin/users/${id}/profile`),
    enabled: !!id,
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post(`/api/admin/users/${id}/approve`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useRejectUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/api/admin/users/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/api/admin/users/${id}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post(`/api/admin/users/${id}/activate`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      userIds,
      reason,
    }: {
      action: 'approve' | 'reject' | 'suspend' | 'activate';
      userIds: string[];
      reason?: string;
    }) => api.post<BulkActionResult>('/api/admin/users/bulk', { action, userIds, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUserEmailInfo(userId: string) {
  return useQuery({
    queryKey: ['user-email-info', userId],
    queryFn: () => userEmailApi.getInfo(userId),
    enabled: !!userId,
  });
}

export function useResetEmailLimit() {
  return useMutation({
    mutationFn: (userId: string) => userEmailApi.resetLimit(userId),
    onSuccess: () => {
      toast.success('Đã reset giới hạn 30 ngày');
    },
    onError: (err: Error) => {
      toast.error('Reset thất bại: ' + err.message);
    },
  });
}

export function useAdminChangeEmail() {
  return useMutation({
    mutationFn: ({ userId, newEmail }: { userId: string; newEmail: string }) =>
      userEmailApi.changeEmail(userId, newEmail),
    onSuccess: () => {
      toast.success('Đã đổi email thành công');
    },
    onError: (err: Error) => {
      const msg = err.message || '';
      if (msg.includes('409') || msg.includes('already')) {
        toast.error('Email này đã được sử dụng');
      } else if (msg.includes('404')) {
        toast.error('Không tìm thấy user');
      } else if (msg.includes('400')) {
        toast.error('Email không hợp lệ');
      } else {
        toast.error('Đổi email thất bại: ' + msg);
      }
    },
  });
}
