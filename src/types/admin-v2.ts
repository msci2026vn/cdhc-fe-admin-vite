// ============================================
// Admin V2 API Types
// ============================================

// Admin Roles
export type AdminRole = 'super_admin' | 'admin' | 'editor';

// Admin User (from admin_users table)
export interface AdminUser {
  id: string;
  userId: string;
  email?: string;
  name?: string;
  adminRole: AdminRole;
  customPermissions?: Record<string, boolean>;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  ipWhitelist?: string[];
  lastLoginAt?: string;
  lastLoginIp?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Session
export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

// Admin Activity Log
export interface AdminActivityLog {
  id: string;
  adminId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================
// Authentication Types
// ============================================

export interface AdminLoginRequest {
  googleToken: string;
}

export interface AdminLoginResponse {
  admin: {
    id: string;
    email: string;
    role: AdminRole;
    twoFactorEnabled: boolean;
    permissions?: Record<string, boolean>;
  };
  token: string;
  expiresAt: string;
  requires2FA?: boolean;
}

export interface Verify2FARequest {
  token: string;
}

export interface Verify2FAResponse {
  success: boolean;
  admin: AdminUser;
  token: string;
}

// ============================================
// Admin Management Types
// ============================================

export interface CreateAdminRequest {
  userEmail: string;
  adminRole: AdminRole;
  customPermissions?: Record<string, boolean>;
  ipWhitelist?: string[];
}

export interface UpdateAdminRequest {
  adminRole?: AdminRole;
  customPermissions?: Record<string, boolean>;
  isActive?: boolean;
  ipWhitelist?: string[];
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  role?: AdminRole;
  active?: boolean;
}

export interface AdminListResponse {
  admins: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// Server Monitoring Types
// ============================================

export interface ServerMetrics {
  timestamp: string;
  uptime: number;
  cpu: {
    cores: number;
    usage: number;
    loadAverage: [number, number, number];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    rxBytes: number;
    txBytes: number;
  };
}

export interface PM2Process {
  pm_id: number;                    // PM2 internal ID
  name: string;                     // Process name
  pid: number;                      // System PID
  status: 'online' | 'stopped' | 'errored' | 'launching';
  cpu: number;                      // CPU percentage
  memory: number;                   // Memory in bytes
  memoryHuman: string;              // Human readable memory (e.g. "50.3 MB")
  uptime: number;                   // Uptime in milliseconds
  uptimeHuman: string;              // Human readable uptime (e.g. "4h 0m")
  restarts: number;                 // Number of restarts
  instances: number;                // Number of instances
  mode: 'fork_mode' | 'cluster_mode';
  // Legacy fields for backward compatibility
  pmId?: number;                    // Alias for pm_id
}

export interface PM2Summary {
  total: number;
  online: number;
  stopped: number;
  errored: number;
}

export interface PM2Response {
  processes: PM2Process[];
  summary: PM2Summary;
  count: number;
}

export interface DatabaseStats {
  size: number;
  connections: {
    total: number;
    active: number;
    idle: number;
  };
  tables: Array<{
    schemaname: string;
    tablename: string;
    row_count: number;
    total_size: number;
  }>;
}

export interface CacheStats {
  // Connection
  connected: boolean;

  // Keys
  keys: number;

  // Memory - New enhanced fields
  usedMemory: number;
  usedMemoryHuman: string;
  maxMemory: number;                // 0 = unlimited
  maxMemoryHuman: string;           // "unlimited" or "256 MB"
  memoryUsagePercent: number;       // 0-100

  // Performance - New fields
  hitRate: number;                  // 0-100
  hits: number;                     // Total hits
  misses: number;                   // Total misses

  // Health - New fields
  evictedKeys: number;              // Keys evicted due to memory
  expiredKeys: number;              // Keys expired by TTL
  connectedClients: number;         // Active connections

  // Info - New fields
  version: string;                  // Redis version
  uptime: number;                   // Uptime in seconds
  uptimeHuman: string;              // Human readable (e.g. "1d 0h")

  // Legacy fields for backward compatibility
  memory?: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  clients?: {
    connected: number;
  };
  stats?: {
    commands: number;
    hits: number;
    misses: number;
  };
}

// ============================================
// Legacy Alert Types (deprecated - use AlertConfiguration from Monitoring section)
// ============================================

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertComparison = '>' | '<' | '>=' | '<=' | '==';

export interface LegacyAlertConfiguration {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  comparison: AlertComparison;
  severity: AlertSeverity;
  enabled: boolean;
  notifyChannels: string[];
  emailRecipients?: string[];
  slackWebhook?: string;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyAlertHistory {
  id: string;
  configId?: string;
  metric: string;
  value: number;
  threshold: number;
  severity: AlertSeverity;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  emailSent: boolean;
  slackSent: boolean;
  createdAt: string;
}

export interface LegacyAlertsResponse {
  configurations: LegacyAlertConfiguration[];
  recentAlerts: LegacyAlertHistory[];
}

// ============================================
// Control Types (Super Admin)
// ============================================

export interface PM2ControlResponse {
  success: boolean;
  message: string;
  output: string;
}

export interface CacheFlushResponse {
  success: boolean;
  message: string;
  keysDeleted?: number;
}

export interface MaintenanceResponse {
  success: boolean;
  maintenanceMode: boolean;
  message?: string;
}

// ============================================
// 2FA Types
// ============================================

export interface Generate2FAResponse {
  secret: string;
  qrCode: string;
  message: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  required: boolean;
}

// ============================================
// Metrics Snapshot (for historical data)
// ============================================

export interface ServerMetricsSnapshot {
  id: string;
  cpuUsage: number;
  cpuLoadAvg1m: number;
  cpuLoadAvg5m: number;
  cpuLoadAvg15m: number;
  memoryTotal: number;
  memoryUsed: number;
  memoryFree: number;
  memoryUsagePercent: number;
  diskTotal: number;
  diskUsed: number;
  diskFree: number;
  diskUsagePercent: number;
  networkRxBytes: number;
  networkTxBytes: number;
  dbConnections?: number;
  dbSize?: number;
  redisMemoryUsed?: number;
  redisKeys?: number;
  createdAt: string;
}

// ============================================
// Permission Constants
// ============================================

export const ADMIN_PERMISSIONS = {
  // Server control
  'server.viewMetrics': 'Xem metrics server',
  'server.controlProcesses': 'Điều khiển PM2 processes',
  'server.flushCache': 'Xóa cache',
  'server.maintenance': 'Bật/tắt maintenance mode',

  // Database
  'database.view': 'Xem thống kê database',

  // Admin management
  'admins.view': 'Xem danh sách admin',
  'admins.create': 'Tạo admin mới',
  'admins.update': 'Cập nhật admin',
  'admins.delete': 'Xóa admin',

  // Users
  'users.view': 'Xem danh sách người dùng',
  'users.approve': 'Duyệt người dùng',
  'users.reject': 'Từ chối người dùng',
  'users.suspend': 'Đình chỉ người dùng',
  'users.delete': 'Xóa người dùng',

  // Alerts
  'alerts.view': 'Xem alerts',
  'alerts.configure': 'Cấu hình alerts',
  'alerts.acknowledge': 'Xác nhận alerts',

  // Logs
  'logs.view': 'Xem activity logs',
  'logs.export': 'Export logs',
} as const;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: Object.keys(ADMIN_PERMISSIONS) as AdminPermission[],
  admin: [
    'server.viewMetrics',
    'database.view',
    'users.view',
    'users.approve',
    'users.reject',
    'users.suspend',
    'alerts.view',
    'alerts.acknowledge',
    'logs.view',
  ],
  editor: [
    'server.viewMetrics',
    'users.view',
    'alerts.view',
    'logs.view',
  ],
};

// ============================================
// Backup Types
// ============================================

export type BackupStatus = 'in_progress' | 'completed' | 'failed';
export type BackupType = 'manual' | 'scheduled';

export interface Backup {
  id: string;
  filename: string;
  size: number;
  status: BackupStatus;
  type: BackupType;
  created_by?: string;
  error_message?: string;
  storage_location?: string;
  created_at: string;
  completed_at?: string;
}

export interface BackupListResponse {
  backups: Backup[];
}

export interface BackupCreateResponse {
  backup: {
    id: string;
    filename: string;
    size: number;
    storage_location: string;
  };
}

export interface BackupRestoreResponse {
  message: string;
}

// ============================================
// Security Types
// ============================================

export type SecurityEventType =
  | 'failed_login'
  | 'suspicious_query'
  | 'permission_change'
  | 'large_export'
  | 'session_revoked'
  | 'ip_whitelisted';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityLog {
  id: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface IPWhitelistEntry {
  id: string;
  ip_address: string;
  description?: string;
  added_by?: string;
  created_at: string;
}

export interface SecurityOverview {
  metrics: {
    failedLogins: number;
    suspiciousQueries: number;
    activeSessions: number;
    sslEnabled: boolean;
    rlsTablesCount: number;
  };
  recentEvents: SecurityLog[];
}

export interface SecurityLogsResponse {
  logs: SecurityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SecuritySession {
  id: string;
  admin_id: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
}

// ============================================
// Alert Types (Feature 3)
// ============================================

export type AlertCondition = 'greater_than' | 'less_than' | 'equals';
export type AlertMetric = 'database_size' | 'slow_query_count' | 'connection_usage' | 'failed_backup' | 'failed_login';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'snoozed';

export interface AlertConfiguration {
  id: string;
  name: string;
  metric: AlertMetric;
  condition: AlertCondition;
  threshold: number;
  severity: SecuritySeverity;
  enabled: boolean;
  notification_emails?: string[];
  check_interval_minutes: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertHistoryItem {
  id: string;
  alert_config_id?: string;
  metric: string;
  current_value: number;
  threshold: number;
  severity: SecuritySeverity;
  message: string;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_at?: string;
  snoozed_until?: string;
  resolved_at?: string;
  notified_at?: string;
  created_at: string;
}

export interface AlertCheckResponse {
  alerts: AlertHistoryItem[];
  count: number;
}

export interface AlertConfigurationsResponse {
  configurations: AlertConfiguration[];
}

export interface AlertHistoryResponse {
  history: AlertHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Metrics Types (Feature 4)
// ============================================

export interface CurrentMetrics {
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

export interface MetricsSnapshot {
  timestamp: string;
  active_connections: number;
  idle_connections: number;
  database_size_mb: number;
  query_count: number;
  avg_query_time_ms: number;
  slow_query_count: number;
}

export interface MetricsHistoryResponse {
  data: MetricsSnapshot[];
}

// ============================================
// Query Analytics Types (Feature 5)
// ============================================

export interface SlowQuery {
  queryid: string;
  query_text: string;
  calls: number;
  avg_time_ms: number;
  max_time_ms: number;
  total_time_ms: number;
  pct_total_time: number;
}

export interface FrequentQuery {
  queryid: string;
  query_text: string;
  calls: number;
  avg_time_ms: number;
  total_time_ms: number;
}

export interface QueryRecommendation {
  type: 'missing_index' | 'sequential_scan' | 'unused_index' | 'table_bloat';
  severity: SecuritySeverity;
  title: string;
  description: string;
  details: unknown[];
  action: string;
}

export interface QueryRecommendationsResponse {
  recommendations: QueryRecommendation[];
  count: number;
}

export interface SlowQueriesResponse {
  queries: SlowQuery[];
}

export interface FrequentQueriesResponse {
  queries: FrequentQuery[];
}
