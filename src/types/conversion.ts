// ============================================
// Conversion Admin Types
// ============================================

export interface ConversionStatsData {
  today: {
    totalConversions: number;
    seedToOgn: number;
    ognToSeed: number;
    totalSeedSent: number;
    totalOgnSent: number;
    totalFeesSeed: number;
    totalFeesOgn: number;
    failedAttempts: number;
    uniqueUsers: number;
  };
  allTime: {
    totalConversions: number;
    totalFeesSeed: number;
    totalFeesOgn: number;
  };
  system: {
    frozen: boolean;
    frozenAt: string | null;
    frozenBy: string | null;
    frozenReason: string | null;
  };
  alerts: {
    openCritical: number;
    openWarning: number;
    openInfo: number;
  };
}

export interface ConversionRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  direction: 'seed_to_ogn' | 'ogn_to_seed';
  tierId: number;
  fromAmount: number;
  toAmount: number;
  feeAmount: number;
  feeCurrency: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  playerLevel: number;
  seedBalanceBefore: number;
  seedBalanceAfter: number;
  ognBalanceBefore: number;
  ognBalanceAfter: number;
  ipAddress: string;
  userAgent: string;
  requestHash: string;
  idempotencyKey: string;
  requestDurationMs: number;
  metadata: Record<string, unknown> | null;
  status: string;
  createdAt: string;
}

export interface ConversionListResponse {
  conversions: ConversionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConversionListParams {
  page?: number;
  limit?: number;
  userId?: string;
  direction?: string;
  tierId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName?: string;
  userEmail?: string;
  totalConversions: number;
  totalSeedSent: number;
  totalOgnSent: number;
  totalFeesSeed: number;
  totalFeesOgn: number;
}

export interface ConversionAlert {
  id: string;
  alertType: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  userId: string | null;
  userName?: string;
  metadata: Record<string, unknown> | null;
  status: 'open' | 'dismissed' | 'escalated';
  dismissedBy: string | null;
  dismissedAt: string | null;
  dismissNote: string | null;
  escalatedBy: string | null;
  escalatedAt: string | null;
  escalateNote: string | null;
  createdAt: string;
}

export interface ConversionAlertsResponse {
  alerts: ConversionAlert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConversionAlertParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  alertType?: string;
}

export interface UserAuditData {
  user: {
    id: string;
    name?: string;
    email?: string;
    frozen: boolean;
    frozenAt?: string;
    frozenBy?: string;
    frozenReason?: string;
  };
  stats: {
    seedToOgn: number;
    ognToSeed: number;
    totalSeedSent: number;
    totalOgnSent: number;
    totalFeesSeed: number;
    totalFeesOgn: number;
    uniqueIps: number;
    firstConversion: string | null;
    lastConversion: string | null;
  };
  conversions: ConversionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FailedAttempt {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  direction: 'seed_to_ogn' | 'ogn_to_seed';
  tierId: number;
  failReason: string;
  failDetail: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface FailedAttemptsResponse {
  attempts: FailedAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FailedAttemptsParams {
  page?: number;
  limit?: number;
  userId?: string;
  failReason?: string;
  ipAddress?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminLogEntry {
  id: string;
  adminUserId: string;
  adminName?: string;
  adminEmail?: string;
  action: string;
  targetUserId: string | null;
  targetAlertId: string | null;
  reason: string | null;
  ipAddress: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminLogsResponse {
  logs: AdminLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FailReasonType =
  | 'insufficient_seed'
  | 'insufficient_ogn'
  | 'level_too_low'
  | 'daily_limit_reached'
  | 'weekly_limit_reached'
  | 'cooldown_active'
  | 'system_frozen'
  | 'user_frozen'
  | 'invalid_tier'
  | 'duplicate_request'
  | 'max_cap_exceeded'
  | 'server_error';

export type AdminActionType =
  | 'freeze_user'
  | 'unfreeze_user'
  | 'freeze_system'
  | 'unfreeze_system'
  | 'dismiss_alert'
  | 'escalate_alert'
  | 'manual_alert_scan';
