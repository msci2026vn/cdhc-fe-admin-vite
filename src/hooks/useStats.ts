

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardStats, StatsPeriod, TopActiveUser, StatsOverview, RoleStats } from '@/types';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get<DashboardStats>('/api/admin/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStatsOverview() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: () => api.get<StatsOverview>('/api/admin/stats/overview'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatsByRole() {
  return useQuery({
    queryKey: ['stats', 'by-role'],
    queryFn: () => api.get<RoleStats[]>('/api/admin/stats/by-role'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatsRegistrations(period: StatsPeriod = 'week') {
  return useQuery({
    queryKey: ['stats', 'registrations', period],
    queryFn: () => api.get(`/api/admin/stats/registrations?period=${period}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatsOnline() {
  return useQuery({
    queryKey: ['stats', 'online'],
    queryFn: () => api.get('/api/admin/stats/online'),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTopActiveUsers(limit = 10, period: StatsPeriod = 'month', role?: string) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('period', period);
  if (role) params.set('role', role);

  return useQuery({
    queryKey: ['stats', 'top-active', { limit, period, role }],
    queryFn: () => api.get<TopActiveUser[]>(`/api/admin/stats/top-active?${params.toString()}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatsPending() {
  return useQuery({
    queryKey: ['stats', 'pending'],
    queryFn: () => api.get('/api/admin/stats/pending'),
    staleTime: 60 * 1000,
  });
}

export function useRefreshStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/api/admin/stats/refresh'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
