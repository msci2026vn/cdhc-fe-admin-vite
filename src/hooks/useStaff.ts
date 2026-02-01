

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Staff {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
  status: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  profile: {
    fullName: string | null;
    phone: string | null;
    department: string | null;
    position: string | null;
  } | null;
}

interface CreateStaffData {
  email: string;
  name: string;
  role: 'admin' | 'editor';
  profile?: {
    fullName?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
  sendInviteEmail?: boolean;
}

interface UpdateStaffData {
  name?: string;
  profile?: {
    fullName?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

export function useStaffList() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get<Staff[]>('/api/admin/staff'),
  });
}

export function useStaff(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => api.get<Staff>(`/api/admin/staff/${id}`),
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffData) => api.post('/api/admin/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) =>
      api.put(`/api/admin/staff/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useChangeStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'editor' }) =>
      api.put(`/api/admin/staff/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
