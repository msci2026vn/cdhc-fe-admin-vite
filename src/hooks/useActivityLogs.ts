

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ActivityLog } from '@/types';

interface LogFilters {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  fromDate?: string;
  toDate?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useActivityLogs(filters: LogFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => api.get<ActivityLog[]>(`/api/admin/activity-logs?${params.toString()}`),
  });
}

export function useMyActivityLogs(filters: LogFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['activity-logs', 'my', filters],
    queryFn: () => api.get<ActivityLog[]>(`/api/admin/activity-logs/my?${params.toString()}`),
  });
}

export function useUserActivityLogs(userId: string, filters: LogFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['activity-logs', 'user', userId, filters],
    queryFn: () => api.get<ActivityLog[]>(`/api/admin/activity-logs/user/${userId}?${params.toString()}`),
    enabled: !!userId,
  });
}

export function useActivityLogsStats() {
  return useQuery({
    queryKey: ['activity-logs', 'stats'],
    queryFn: () => api.get('/api/admin/activity-logs/stats'),
  });
}
