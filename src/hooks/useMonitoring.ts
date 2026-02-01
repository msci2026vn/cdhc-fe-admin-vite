

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminV2Api } from '@/lib/api';

// ============================================
// Server Metrics Hook
// ============================================

export function useServerMetrics(refetchInterval = 5000) {
  return useQuery({
    queryKey: ['monitoring', 'metrics'],
    queryFn: async () => {
      const response = await adminV2Api.monitoring.getMetrics();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch metrics');
    },
    refetchInterval, // Mặc định 5 giây
    staleTime: 3000,
  });
}

// ============================================
// PM2 Processes Hook - Updated for new backend structure
// ============================================

interface PM2ProcessData {
  pm_id: number;
  name: string;
  pid: number;
  status: 'online' | 'stopped' | 'errored' | 'launching';
  cpu: number;
  memory: number;
  memoryHuman: string;
  uptime: number;
  uptimeHuman: string;
  restarts: number;
  instances: number;
  mode: 'fork_mode' | 'cluster_mode';
}

interface PM2ResponseData {
  processes: PM2ProcessData[];
  summary: {
    total: number;
    online: number;
    stopped: number;
    errored: number;
  };
  count: number;
}

export function usePM2Processes(refetchInterval = 10000) {
  return useQuery({
    queryKey: ['monitoring', 'processes'],
    queryFn: async () => {
      const response = await adminV2Api.monitoring.getProcesses();

      if (response.success && response.data) {
        // Legacy: array directly
        if (Array.isArray(response.data)) {
          return response.data;
        }

        // New structure: { processes: [...], summary: {...}, count: n }
        const data = response.data as unknown as PM2ResponseData;
        if (data.processes && Array.isArray(data.processes)) {
          // Map to include backward compatibility fields
          return data.processes.map(proc => ({
            ...proc,
            pmId: proc.pm_id, // Backward compatibility
          }));
        }

        return [];
      }
      throw new Error(response.error?.message || 'Failed to fetch processes');
    },
    refetchInterval,
    staleTime: 5000,
  });
}

// Hook to get PM2 summary stats
export function usePM2Summary(refetchInterval = 10000) {
  return useQuery({
    queryKey: ['monitoring', 'processes', 'summary'],
    queryFn: async () => {
      const response = await adminV2Api.monitoring.getProcesses();

      if (response.success && response.data) {
        // New structure: { processes: [...], summary: {...}, count: n }
        const data = response.data as unknown as PM2ResponseData;
        return data.summary || { total: 0, online: 0, stopped: 0, errored: 0 };
      }
      throw new Error(response.error?.message || 'Failed to fetch processes summary');
    },
    refetchInterval,
    staleTime: 5000,
  });
}

// ============================================
// Database Stats Hook
// ============================================

export function useDatabaseStats(refetchInterval = 30000) {
  return useQuery({
    queryKey: ['monitoring', 'database'],
    queryFn: async () => {
      const response = await adminV2Api.monitoring.getDatabase();
      console.log('[DEBUG] useDatabaseStats - response:', response);
      console.log('[DEBUG] useDatabaseStats - response.data:', response.data);

      if (response.success && response.data) {
        // API trả về { size, connections, tables } trực tiếp trong data
        // hoặc { database: { size, connections, tables } }
        const data = response.data as { database?: { size: number; connections: { total: number; active: number; idle: number }; tables: Array<{ schemaname: string; tablename: string; row_count: number; total_size: number }> }; size?: number; connections?: { total: number; active: number; idle: number }; tables?: Array<{ schemaname: string; tablename: string; row_count: number; total_size: number }> };

        // Nếu có wrapper database
        if (data.database) {
          console.log('[DEBUG] useDatabaseStats - returning data.database:', data.database);
          return data.database;
        }

        // Nếu data trực tiếp là database stats
        if (data.size !== undefined && data.connections && data.tables) {
          console.log('[DEBUG] useDatabaseStats - returning data directly:', data);
          return data as { size: number; connections: { total: number; active: number; idle: number }; tables: Array<{ schemaname: string; tablename: string; row_count: number; total_size: number }> };
        }

        console.error('[DEBUG] useDatabaseStats - unexpected data structure:', data);
        throw new Error('Unexpected database stats structure');
      }
      throw new Error(response.error?.message || 'Failed to fetch database stats');
    },
    refetchInterval, // Mặc định 30 giây
    staleTime: 15000,
  });
}

// ============================================
// Table Data Hook
// ============================================

// Column có thể là string hoặc object
export interface ColumnInfo {
  column_name: string;
  data_type?: string;
  is_nullable?: string;
  character_maximum_length?: number | null;
  column_default?: string | null;
}

export interface TableDataResult {
  rows: Record<string, unknown>[];
  columns: (string | ColumnInfo)[];
  total: number;
  page: number;
  limit: number;
  tableName?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useTableData(tableName: string, params?: { page?: number; limit?: number }) {
  return useQuery<TableDataResult>({
    queryKey: ['monitoring', 'table', tableName, params],
    queryFn: async (): Promise<TableDataResult> => {
      const response = await adminV2Api.monitoring.getTableData(tableName, params);
      console.log('[DEBUG] useTableData - response:', response);
      console.log('[DEBUG] useTableData - response.data:', response.data);

      if (response.success && response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = response.data as any;

        // Log cấu trúc để debug
        console.log('[DEBUG] useTableData - data keys:', Object.keys(data));
        console.log('[DEBUG] useTableData - columns type:', typeof data.columns, Array.isArray(data.columns) ? 'array' : '');
        if (data.columns && data.columns[0]) {
          console.log('[DEBUG] useTableData - first column:', data.columns[0], typeof data.columns[0]);
        }

        // Xử lý nhiều format response khác nhau
        const result: TableDataResult = {
          rows: data.rows || [],
          columns: data.columns || [],
          total: data.total ?? data.pagination?.total ?? 0,
          page: data.page ?? data.pagination?.page ?? params?.page ?? 1,
          limit: data.limit ?? data.pagination?.limit ?? params?.limit ?? 20,
        };

        console.log('[DEBUG] useTableData - returning result:', result);
        return result;
      }
      throw new Error(response.error?.message || 'Failed to fetch table data');
    },
    enabled: !!tableName,
    staleTime: 30000,
  });
}

// ============================================
// Cache Stats Hook - Updated for new backend structure
// ============================================

// New enhanced cache stats type
interface EnhancedCacheStatsData {
  // Connection
  connected: boolean;
  // Keys
  keys: number;
  // Memory - New enhanced fields
  usedMemory: number;
  usedMemoryHuman: string;
  maxMemory: number;
  maxMemoryHuman: string;
  memoryUsagePercent: number;
  // Performance - New fields
  hitRate: number;
  hits: number;
  misses: number;
  // Health - New fields
  evictedKeys: number;
  expiredKeys: number;
  connectedClients: number;
  // Info - New fields
  version: string;
  uptime: number;
  uptimeHuman: string;
}

// Legacy cache stats type for backward compatibility
interface LegacyCacheStatsData {
  memory: { used: number; peak: number; fragmentation: number };
  keys: number;
  clients: { connected: number };
  stats: { commands: number; hits: number; misses: number };
}

export function useCacheStats(refetchInterval = 15000) {
  return useQuery<EnhancedCacheStatsData>({
    queryKey: ['monitoring', 'cache'],
    queryFn: async (): Promise<EnhancedCacheStatsData> => {
      const response = await adminV2Api.monitoring.getCache();

      if (response.success && response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = response.data as any;

        // New structure: has connected, usedMemory, hitRate, etc.
        if (data.connected !== undefined || data.usedMemory !== undefined) {
          return {
            connected: data.connected ?? true,
            keys: data.keys ?? 0,
            usedMemory: data.usedMemory ?? 0,
            usedMemoryHuman: data.usedMemoryHuman ?? '0 B',
            maxMemory: data.maxMemory ?? 0,
            maxMemoryHuman: data.maxMemoryHuman ?? 'unlimited',
            memoryUsagePercent: data.memoryUsagePercent ?? 0,
            hitRate: data.hitRate ?? 0,
            hits: data.hits ?? 0,
            misses: data.misses ?? 0,
            evictedKeys: data.evictedKeys ?? 0,
            expiredKeys: data.expiredKeys ?? 0,
            connectedClients: data.connectedClients ?? 0,
            version: data.version ?? 'unknown',
            uptime: data.uptime ?? 0,
            uptimeHuman: data.uptimeHuman ?? '0s',
          };
        }

        // Legacy structure: has memory.used, clients.connected, stats.hits
        if (data.memory !== undefined && data.keys !== undefined) {
          const legacyData = data as LegacyCacheStatsData;
          const hits = legacyData.stats?.hits ?? 0;
          const misses = legacyData.stats?.misses ?? 0;
          const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

          return {
            connected: true,
            keys: legacyData.keys,
            usedMemory: legacyData.memory?.used ?? 0,
            usedMemoryHuman: formatBytes(legacyData.memory?.used ?? 0),
            maxMemory: 0,
            maxMemoryHuman: 'unlimited',
            memoryUsagePercent: 0,
            hitRate: hitRate,
            hits: hits,
            misses: misses,
            evictedKeys: 0,
            expiredKeys: 0,
            connectedClients: legacyData.clients?.connected ?? 0,
            version: 'unknown',
            uptime: 0,
            uptimeHuman: 'unknown',
          };
        }

        // Wrapper: { cache: {...} }
        if (data.cache) {
          return useCacheStats.arguments[0] ? data.cache : data.cache;
        }

        throw new Error('Unexpected cache stats structure');
      }
      throw new Error(response.error?.message || 'Failed to fetch cache stats');
    },
    refetchInterval,
    staleTime: 10000,
  });
}

// ============================================
// Alerts Hook
// ============================================

interface UseAlertsParams {
  limit?: number;
  severity?: 'info' | 'warning' | 'critical';
  acknowledged?: boolean;
}

export function useAlerts(params?: UseAlertsParams) {
  return useQuery({
    queryKey: ['monitoring', 'alerts', params],
    queryFn: async () => {
      const response = await adminV2Api.monitoring.getAlerts(params);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch alerts');
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// ============================================
// PM2 Control Mutations (Super Admin only)
// ============================================

export function useRestartPM2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (processName?: string) => {
      const response = await adminV2Api.control.pm2.restart(processName);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to restart process');
    },
    onSuccess: () => {
      // Refresh processes list sau khi restart
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'processes'] });
    },
  });
}

export function useReloadPM2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (processName?: string) => {
      const response = await adminV2Api.control.pm2.reload(processName);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to reload process');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'processes'] });
    },
  });
}

export function usePM2Logs(params?: { lines?: number; type?: 'out' | 'error' }) {
  return useQuery({
    queryKey: ['monitoring', 'pm2-logs', params],
    queryFn: async () => {
      const response = await adminV2Api.control.pm2.getLogs(params);
      if (response.success && response.data) {
        return response.data.logs;
      }
      throw new Error(response.error?.message || 'Failed to fetch logs');
    },
    enabled: false, // Chỉ fetch khi gọi refetch()
  });
}

// ============================================
// Cache Control Mutations (Super Admin only)
// ============================================

export function useFlushCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pattern?: string) => {
      const response = await adminV2Api.control.cache.flush(pattern);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to flush cache');
    },
    onSuccess: () => {
      // Refresh cache stats sau khi flush
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'cache'] });
    },
  });
}

// ============================================
// Maintenance Mode Mutation (Super Admin only)
// ============================================

export function useMaintenanceMode() {
  return useMutation({
    mutationFn: async ({ enabled, message }: { enabled: boolean; message?: string }) => {
      const response = await adminV2Api.control.maintenance.set(enabled, message);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to set maintenance mode');
    },
  });
}

// ============================================
// Combined Dashboard Hook
// ============================================

export function useDashboardData() {
  const metrics = useServerMetrics();
  const processes = usePM2Processes();
  const database = useDatabaseStats();
  const cache = useCacheStats();
  const alerts = useAlerts({ limit: 10 });

  return {
    metrics,
    processes,
    database,
    cache,
    alerts,
    isLoading:
      metrics.isLoading ||
      processes.isLoading ||
      database.isLoading ||
      cache.isLoading ||
      alerts.isLoading,
    isError:
      metrics.isError ||
      processes.isError ||
      database.isError ||
      cache.isError ||
      alerts.isError,
  };
}

// ============================================
// Helper Functions
// ============================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatUptimeMs(ms: number): string {
  return formatUptime(Math.floor(ms / 1000));
}

export function getStatusColor(status: 'online' | 'stopped' | 'errored'): string {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800';
    case 'stopped':
      return 'bg-yellow-100 text-yellow-800';
    case 'errored':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getSeverityColor(severity: 'info' | 'warning' | 'critical'): string {
  switch (severity) {
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getUsageColor(percent: number): string {
  if (percent >= 90) return 'text-red-600';
  if (percent >= 80) return 'text-orange-500';
  if (percent >= 70) return 'text-yellow-500';
  return 'text-green-600';
}

// ============================================
// Backup Hooks
// ============================================

export function useBackupList() {
  return useQuery({
    queryKey: ['backup', 'list'],
    queryFn: async () => {
      const response = await adminV2Api.backup.list();
      console.log('[DEBUG] useBackupList - response:', response);

      if (response.success && response.data) {
        const data = response.data as { backups?: unknown[] };
        if (data.backups && Array.isArray(data.backups)) {
          return data.backups;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }
      throw new Error(response.error?.message || 'Failed to fetch backups');
    },
    staleTime: 30000,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await adminV2Api.backup.create();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to create backup');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup', 'list'] });
    },
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      const response = await adminV2Api.backup.restore(backupId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to restore backup');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup', 'list'] });
    },
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      const response = await adminV2Api.backup.delete(backupId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to delete backup');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup', 'list'] });
    },
  });
}

// ============================================
// Security Hooks
// ============================================

interface SecurityOverviewData {
  metrics: {
    failedLogins: number;
    suspiciousQueries: number;
    activeSessions: number;
    sslEnabled: boolean;
    rlsTablesCount: number;
  };
  recentEvents: Array<{
    id: string;
    event_type: string;
    severity: string;
    user_id?: string;
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, unknown>;
    created_at: string;
  }>;
}

export function useSecurityOverview(refetchInterval = 30000) {
  return useQuery<SecurityOverviewData>({
    queryKey: ['security', 'overview'],
    queryFn: async (): Promise<SecurityOverviewData> => {
      const response = await adminV2Api.security.getOverview();
      console.log('[DEBUG] useSecurityOverview - response:', response);

      if (response.success && response.data) {
        const data = response.data as SecurityOverviewData;
        return data;
      }
      throw new Error(response.error?.message || 'Failed to fetch security overview');
    },
    refetchInterval,
    staleTime: 15000,
  });
}

interface UseSecurityLogsParams {
  event_type?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

interface SecurityLogsData {
  logs: Array<{
    id: string;
    event_type: string;
    severity: string;
    user_id?: string;
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, unknown>;
    created_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useSecurityLogs(params?: UseSecurityLogsParams) {
  return useQuery<SecurityLogsData>({
    queryKey: ['security', 'logs', params],
    queryFn: async (): Promise<SecurityLogsData> => {
      const response = await adminV2Api.security.getLogs(params);
      console.log('[DEBUG] useSecurityLogs - response:', response);

      if (response.success && response.data) {
        return response.data as SecurityLogsData;
      }
      throw new Error(response.error?.message || 'Failed to fetch security logs');
    },
    staleTime: 30000,
  });
}

interface SecuritySessionData {
  id: string;
  admin_id: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
}

export function useSecuritySessions() {
  return useQuery<SecuritySessionData[]>({
    queryKey: ['security', 'sessions'],
    queryFn: async (): Promise<SecuritySessionData[]> => {
      const response = await adminV2Api.security.getSessions();
      console.log('[DEBUG] useSecuritySessions - response:', response);

      if (response.success && response.data) {
        const data = response.data as { sessions?: SecuritySessionData[] };
        if (data.sessions) {
          return data.sessions;
        }
        if (Array.isArray(response.data)) {
          return response.data as SecuritySessionData[];
        }
        return [];
      }
      throw new Error(response.error?.message || 'Failed to fetch sessions');
    },
    staleTime: 30000,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await adminV2Api.security.revokeSession(sessionId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to revoke session');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'overview'] });
    },
  });
}

interface IPWhitelistData {
  id: string;
  ip_address: string;
  description?: string;
  added_by?: string;
  created_at: string;
}

export function useIPWhitelist() {
  return useQuery<IPWhitelistData[]>({
    queryKey: ['security', 'ip-whitelist'],
    queryFn: async (): Promise<IPWhitelistData[]> => {
      const response = await adminV2Api.security.getIPWhitelist();
      console.log('[DEBUG] useIPWhitelist - response:', response);

      if (response.success && response.data) {
        const data = response.data as { whitelist?: IPWhitelistData[] };
        if (data.whitelist) {
          return data.whitelist;
        }
        if (Array.isArray(response.data)) {
          return response.data as IPWhitelistData[];
        }
        return [];
      }
      throw new Error(response.error?.message || 'Failed to fetch IP whitelist');
    },
    staleTime: 60000,
  });
}

export function useAddToIPWhitelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { ip_address: string; description?: string }) => {
      const response = await adminV2Api.security.addToIPWhitelist(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to add IP to whitelist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'ip-whitelist'] });
    },
  });
}

export function useRemoveFromIPWhitelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminV2Api.security.removeFromIPWhitelist(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to remove IP from whitelist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'ip-whitelist'] });
    },
  });
}

// ============================================
// Alert Hooks (Feature 3)
// ============================================

interface AlertHistoryItem {
  id: string;
  alert_config_id?: string;
  metric: string;
  current_value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'snoozed';
  acknowledged_by?: string;
  acknowledged_at?: string;
  snoozed_until?: string;
  resolved_at?: string;
  created_at: string;
}

interface AlertCheckData {
  alerts: AlertHistoryItem[];
  count: number;
}

export function useAlertCheck(refetchInterval = 10000) {
  return useQuery<AlertCheckData>({
    queryKey: ['alerts', 'check'],
    queryFn: async (): Promise<AlertCheckData> => {
      const response = await adminV2Api.alerts.check();
      console.log('[DEBUG] useAlertCheck - response:', response);

      if (response.success && response.data) {
        return response.data as AlertCheckData;
      }
      throw new Error(response.error?.message || 'Failed to check alerts');
    },
    refetchInterval,
    refetchIntervalInBackground: true,
    staleTime: 5000,
  });
}

interface AlertConfigurationData {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notification_emails?: string[];
  check_interval_minutes: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface AlertConfigurationsData {
  configurations: AlertConfigurationData[];
}

export function useAlertConfigurations() {
  return useQuery<AlertConfigurationData[]>({
    queryKey: ['alerts', 'configurations'],
    queryFn: async (): Promise<AlertConfigurationData[]> => {
      const response = await adminV2Api.alerts.getConfigurations();
      console.log('[DEBUG] useAlertConfigurations - response:', response);

      if (response.success && response.data) {
        const data = response.data as AlertConfigurationsData;
        return data.configurations || [];
      }
      throw new Error(response.error?.message || 'Failed to fetch alert configurations');
    },
    staleTime: 60000,
  });
}

interface CreateAlertConfigData {
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: string;
  enabled?: boolean;
  notification_emails?: string[];
  check_interval_minutes?: number;
}

export function useCreateAlertConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAlertConfigData) => {
      const response = await adminV2Api.alerts.createConfiguration(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to create alert configuration');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'configurations'] });
    },
  });
}

export function useUpdateAlertConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAlertConfigData> }) => {
      const response = await adminV2Api.alerts.updateConfiguration(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to update alert configuration');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'configurations'] });
    },
  });
}

export function useDeleteAlertConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminV2Api.alerts.deleteConfiguration(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to delete alert configuration');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'configurations'] });
    },
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await adminV2Api.alerts.acknowledge(alertId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to acknowledge alert');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'check'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'history'] });
    },
  });
}

export function useSnoozeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, minutes }: { alertId: string; minutes: number }) => {
      const response = await adminV2Api.alerts.snooze(alertId, minutes);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to snooze alert');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'check'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'history'] });
    },
  });
}

interface AlertHistoryData {
  history: AlertHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useAlertHistory(params?: { page?: number; limit?: number }) {
  return useQuery<AlertHistoryData>({
    queryKey: ['alerts', 'history', params],
    queryFn: async (): Promise<AlertHistoryData> => {
      const response = await adminV2Api.alerts.getHistory(params);
      console.log('[DEBUG] useAlertHistory - response:', response);

      if (response.success && response.data) {
        return response.data as AlertHistoryData;
      }
      throw new Error(response.error?.message || 'Failed to fetch alert history');
    },
    staleTime: 30000,
  });
}

// ============================================
// Metrics Hooks (Feature 4)
// ============================================

interface CurrentMetricsHookData {
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  database: {
    size_mb: string;
  };
  queries: {
    total: number;
    avg_time_ms: string;
    slow_count: number;
  };
  table_sizes: Array<{
    name: string;
    size_mb: string;
  }>;
}

export function useCurrentMetrics(refetchInterval = 10000) {
  return useQuery<CurrentMetricsHookData>({
    queryKey: ['metrics', 'current'],
    queryFn: async (): Promise<CurrentMetricsHookData> => {
      const response = await adminV2Api.metrics.getCurrent();
      console.log('[DEBUG] useCurrentMetrics - response:', response);

      if (response.success && response.data) {
        const data = response.data as { data?: CurrentMetricsHookData } & CurrentMetricsHookData;
        return data.data || data;
      }
      throw new Error(response.error?.message || 'Failed to fetch current metrics');
    },
    refetchInterval,
    staleTime: 5000,
  });
}

interface MetricsSnapshotHookData {
  timestamp: string;
  active_connections: number;
  idle_connections: number;
  database_size_mb: number;
  query_count: number;
  avg_query_time_ms: number;
  slow_query_count: number;
}

export function useMetricsHistory(hours = 24) {
  return useQuery<MetricsSnapshotHookData[]>({
    queryKey: ['metrics', 'history', hours],
    queryFn: async (): Promise<MetricsSnapshotHookData[]> => {
      const response = await adminV2Api.metrics.getHistory(hours);
      console.log('[DEBUG] useMetricsHistory - response:', response);

      if (response.success && response.data) {
        const data = response.data as { data?: MetricsSnapshotHookData[] };
        return data.data || [];
      }
      throw new Error(response.error?.message || 'Failed to fetch metrics history');
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  });
}

export function useCaptureMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await adminV2Api.metrics.capture();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to capture metrics');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}

// ============================================
// Query Analytics Hooks (Feature 5)
// ============================================

interface SlowQueryHookData {
  queryid: string;
  query_text: string;
  calls: number;
  avg_time_ms: number;
  max_time_ms: number;
  total_time_ms: number;
  pct_total_time: number;
}

export function useSlowQueries(limit = 20) {
  return useQuery<SlowQueryHookData[]>({
    queryKey: ['query-analytics', 'slow-queries', limit],
    queryFn: async (): Promise<SlowQueryHookData[]> => {
      const response = await adminV2Api.queryAnalytics.getSlowQueries(limit);
      console.log('[DEBUG] useSlowQueries - response:', response);

      if (response.success && response.data) {
        const data = response.data as { queries?: SlowQueryHookData[] };
        return data.queries || [];
      }
      throw new Error(response.error?.message || 'Failed to fetch slow queries');
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

interface FrequentQueryHookData {
  queryid: string;
  query_text: string;
  calls: number;
  avg_time_ms: number;
  total_time_ms: number;
}

export function useFrequentQueries(limit = 20) {
  return useQuery<FrequentQueryHookData[]>({
    queryKey: ['query-analytics', 'frequent-queries', limit],
    queryFn: async (): Promise<FrequentQueryHookData[]> => {
      const response = await adminV2Api.queryAnalytics.getFrequentQueries(limit);
      console.log('[DEBUG] useFrequentQueries - response:', response);

      if (response.success && response.data) {
        const data = response.data as { queries?: FrequentQueryHookData[] };
        return data.queries || [];
      }
      throw new Error(response.error?.message || 'Failed to fetch frequent queries');
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

interface QueryRecommendationHookData {
  type: 'missing_index' | 'sequential_scan' | 'unused_index' | 'table_bloat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  details: unknown[];
  action: string;
}

interface QueryRecommendationsHookData {
  recommendations: QueryRecommendationHookData[];
  count: number;
}

export function useQueryRecommendations() {
  return useQuery<QueryRecommendationsHookData>({
    queryKey: ['query-analytics', 'recommendations'],
    queryFn: async (): Promise<QueryRecommendationsHookData> => {
      const response = await adminV2Api.queryAnalytics.getRecommendations();
      console.log('[DEBUG] useQueryRecommendations - response:', response);

      if (response.success && response.data) {
        return response.data as QueryRecommendationsHookData;
      }
      throw new Error(response.error?.message || 'Failed to fetch query recommendations');
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useExplainQuery() {
  return useMutation({
    mutationFn: async (queryText: string) => {
      const response = await adminV2Api.queryAnalytics.explain(queryText);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to explain query');
    },
  });
}

export function useResetQueryStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await adminV2Api.queryAnalytics.resetStats();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to reset query statistics');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['query-analytics'] });
    },
  });
}

// ============================================
// Index Hooks (Feature 6)
// ============================================

interface IndexHookData {
  schemaname: string;
  tablename: string;
  indexname: string;
  indexdef: string;
  size: string;
  usage_count: number;
  usage_level: string;
}

export function useIndexList() {
  return useQuery<IndexHookData[]>({
    queryKey: ['indexes', 'list'],
    queryFn: async (): Promise<IndexHookData[]> => {
      const response = await adminV2Api.indexes.list();
      console.log('[DEBUG] useIndexList - response:', response);

      if (response.success && response.data) {
        const data = response.data as { indexes?: IndexHookData[] };
        return data.indexes || [];
      }
      throw new Error(response.error?.message || 'Failed to fetch indexes');
    },
    staleTime: 60000,
  });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { table: string; column: string; name: string }) => {
      const response = await adminV2Api.indexes.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to create index');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indexes', 'list'] });
    },
  });
}

// ============================================
// Maintenance Hooks (Feature 7)
// ============================================

export function useVacuum() {
  return useMutation({
    mutationFn: async (tableName?: string) => {
      const response = await adminV2Api.maintenance.vacuum(tableName);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to run VACUUM');
    },
  });
}

export function useAnalyze() {
  return useMutation({
    mutationFn: async (tableName?: string) => {
      const response = await adminV2Api.maintenance.analyze(tableName);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to run ANALYZE');
    },
  });
}
