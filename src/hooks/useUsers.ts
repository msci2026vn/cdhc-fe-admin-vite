

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
    queryFn: () => api.get<{ user: User; profile: UserProfile['profile'] }>(`/api/admin/users/${id}/profile`),
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
