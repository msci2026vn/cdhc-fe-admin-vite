export interface StatsOverview {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export interface RoleStats {
  role: string;
  count: number;
  label: string;
}

export interface RegistrationStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface OnlineStats {
  now: number;
  today: number;
  thisWeek: number;
}

export interface DashboardStats {
  overview: StatsOverview;
  byRole: RoleStats[];
  registrations: RegistrationStats;
  online: OnlineStats;
}

export interface StatsResponse {
  success: boolean;
  data: DashboardStats;
  cached?: boolean;
  cachedAt?: string;
}

export type StatsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface TopActiveUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  activityCount: number;
  lastActiveAt: string;
}
