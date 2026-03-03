import type { ApiResponse } from '@/types';
import type {
  Backup,
  SecurityOverview,
  SecurityLogsResponse,
  SecuritySession,
  IPWhitelistEntry,
  AlertCheckResponse,
  AlertConfigurationsResponse,
  AlertConfiguration as AlertConfigurationItem,
  AlertHistoryResponse as AlertHistoryResponseType,
  CurrentMetrics as CurrentMetricsData,
  MetricsSnapshot as MetricsSnapshotData,
  SlowQuery as SlowQueryData,
  FrequentQuery as FrequentQueryData,
  QueryRecommendation as QueryRecommendationData,
} from '@/types/admin-v2';
import { authLogger } from '@/lib/auth-logger';

// Local types for API requests
interface CreateAlertConfigRequest {
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: string;
  enabled?: boolean;
  notification_emails?: string[];
  check_interval_minutes?: number;
}

interface IndexData {
  schemaname: string;
  tablename: string;
  indexname: string;
  indexdef: string;
  size: string;
  usage_count: number;
  usage_level: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://sta.cdhc.vn';

// Log API_BASE on init
if (typeof window !== 'undefined') {
  authLogger.info('ApiClient', 'Initialized (Cookie-based auth)', {
    API_BASE,
    origin: window.location.origin,
  });
}

// Flag de tranh infinite refresh loop
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  endpoint: string;
  options: RequestInit;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

class ApiClient {
  private async handleResponse<T>(
    response: Response,
    endpoint: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    if (response.status === 401) {
      // Token expired - try to refresh
      return this.handleUnauthorized<T>(endpoint, options);
    }

    // Handle non-OK responses (4xx/5xx) that aren't 401
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        const rawError = errorJson.message || errorJson.error;
        errorMessage = typeof rawError === 'string' ? rawError : rawError?.message || errorMessage;
      } catch {
        // Response body not JSON, use default message
      }
      authLogger.error('ApiClient', `HTTP Error: ${endpoint}`, {
        status: response.status,
        error: errorMessage,
      });
      return {
        success: false,
        error: { message: errorMessage },
      };
    }

    const json = await response.json();

    // Log raw response for debugging
    authLogger.info('ApiClient', `Raw response: ${endpoint}`, {
      hasSuccess: 'success' in json,
      hasData: 'data' in json,
      hasError: 'error' in json,
      keys: Object.keys(json),
      // Log data structure if present
      dataKeys: json.data ? Object.keys(json.data) : null,
      dataPreview: json.data ? JSON.stringify(json.data).substring(0, 200) + '...' : null,
    });

    // Backend returns: { success: true, data: {...} } or { success: false, error: '...' }
    // Need to unwrap and return in ApiResponse format

    if (json && typeof json === 'object') {
      // Case 1: { success: true, data: {...} } - unwrap data
      if (json.success === true && 'data' in json) {
        authLogger.success('ApiClient', `Unwrapping response data: ${endpoint}`, {
          dataKeys: Object.keys(json.data),
        });
        return {
          success: true,
          data: json.data as T,
        };
      }

      // Case 2: { success: false, error: '...' } - return error
      if (json.success === false) {
        const rawErr = json.error || json.message || 'Request failed';
        const errorMessage =
          typeof rawErr === 'string' ? rawErr : rawErr?.message || 'Request failed';
        authLogger.error('ApiClient', `Backend returned error: ${endpoint}`, {
          error: errorMessage,
        });
        return {
          success: false,
          error: { message: errorMessage },
        };
      }

      // Case 3: Response already has success/data structure (legacy format)
      if ('success' in json) {
        authLogger.info('ApiClient', `Returning as-is (has success): ${endpoint}`);
        return json as ApiResponse<T>;
      }
    }

    // Fallback: wrap raw response as data
    authLogger.warning('ApiClient', `Wrapping raw response: ${endpoint}`, {
      keys: Object.keys(json),
    });
    return {
      success: true,
      data: json as T,
    };
  }

  private async handleUnauthorized<T>(
    endpoint: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    // Neu dang refresh -> queue request nay lai
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(this.request<T>(endpoint, options)),
          reject,
          endpoint,
          options,
        });
      });
    }

    isRefreshing = true;

    try {
      authLogger.info('ApiClient', 'Attempting cookie-based token refresh...');

      // Call refresh endpoint - backend uses httpOnly cookies, no need to send token in body
      const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (refreshResponse.ok) {
        authLogger.success('ApiClient', 'Cookie refresh successful');

        // Refresh thanh cong -> process queue
        processQueue(null);
        isRefreshing = false;

        // Retry original request (cookies already updated by backend)
        return this.request<T>(endpoint, options);
      } else {
        // Refresh that bai -> logout
        authLogger.error('ApiClient', 'Cookie refresh failed', {
          status: refreshResponse.status,
        });
        throw new Error('Refresh token failed');
      }
    } catch (error) {
      // Refresh that bai -> logout
      processQueue(error as Error);
      isRefreshing = false;

      if (typeof window !== 'undefined') {
        // Dynamic import de tranh circular dependency
        const { useAuthStore } = await import('@/stores/authStore');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }

      throw new Error('Unauthorized');
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;

    // Build headers - NO Authorization header, rely on httpOnly cookies
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    authLogger.network('ApiClient', `Request: ${options.method || 'GET'} ${endpoint}`, {
      url,
      authMethod: 'cookie-based (httpOnly)',
    });

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // CRITICAL: Send httpOnly cookies automatically
        headers,
      });

      authLogger.network('ApiClient', `Response: ${response.status} ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      return this.handleResponse<T>(response, endpoint, options);
    } catch (error) {
      authLogger.error('ApiClient', `Network Error: ${endpoint}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  get<T>(url: string) {
    return this.request<T>(url);
  }

  post<T>(url: string, data?: unknown) {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(url: string, data?: unknown) {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  }

  async downloadFile(url: string, filename: string) {
    // Use cookie-based auth - no Authorization header needed
    const response = await fetch(`${API_BASE}${url}`, {
      credentials: 'include', // Send httpOnly cookies automatically
    });

    if (!response.ok) {
      authLogger.error('ApiClient', `Download failed: ${url}`, {
        status: response.status,
      });
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }
}

export const api = new ApiClient();

// ============================================
// Admin V2 API Functions
// ============================================

// ============================================
// Legacy API (Currently active on backend)
// ============================================
export const legacyApi = {
  auth: {
    // Login with Google OAuth - uses /api/auth/google (current backend)
    loginWithGoogle: (idToken: string) =>
      api.post<LegacyAuthResponse>('/api/auth/google', { idToken }),

    logout: () => api.post('/api/auth/logout'),

    refresh: (refreshToken: string) =>
      api.post<LegacyAuthResponse>('/api/auth/refresh', { refreshToken }),
  },
};

// Legacy Auth Response type
export interface LegacyAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
  needRegister?: boolean;
  googleUser?: { email: string; name: string };
}

export const adminV2Api = {
  // ==========================================
  // Authentication (Admin V2 - for future use)
  // ==========================================
  auth: {
    login: (googleToken: string) =>
      api.post<AdminLoginResponse>('/api/admin-v2/auth/login', { googleToken }),

    verify2FA: (token: string) =>
      api.post<AdminLoginResponse>('/api/admin-v2/auth/verify-2fa', { token }),

    logout: () => api.post('/api/admin-v2/auth/logout'),
  },

  // ==========================================
  // Current Admin
  // ==========================================
  me: {
    get: () => api.get<AdminUser>('/api/admin-v2/me'),
  },

  // ==========================================
  // Admin Management (Super Admin only)
  // ==========================================
  admins: {
    list: (params?: { page?: number; limit?: number; role?: string; active?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.role) query.set('role', params.role);
      if (params?.active !== undefined) query.set('active', params.active.toString());
      return api.get<{ admins: AdminUser[]; total: number; page: number; limit: number }>(
        `/api/admin-v2/admins?${query.toString()}`,
      );
    },

    create: (data: CreateAdminRequest) =>
      api.post<{ admin: AdminUser }>('/api/admin-v2/admins', data),

    update: (id: string, data: UpdateAdminRequest) =>
      api.put<{ admin: AdminUser }>(`/api/admin-v2/admins/${id}`, data),

    delete: (id: string) => api.delete(`/api/admin-v2/admins/${id}`),
  },

  // ==========================================
  // Monitoring
  // ==========================================
  monitoring: {
    getMetrics: () => api.get<ServerMetrics>('/api/admin-v2/monitoring/metrics'),

    getProcesses: () => api.get<{ processes: PM2Process[] }>('/api/admin-v2/monitoring/processes'),

    getDatabase: () => api.get<{ database: DatabaseStats }>('/api/admin-v2/monitoring/database'),

    getTableData: (tableName: string, params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      return api.get<{
        rows: Record<string, unknown>[];
        columns: string[];
        total: number;
        page: number;
        limit: number;
      }>(`/api/admin-v2/monitoring/database/table/${tableName}?${query.toString()}`);
    },

    getCache: () => api.get<{ cache: CacheStats }>('/api/admin-v2/monitoring/cache'),

    getAlerts: (params?: { limit?: number; severity?: string; acknowledged?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.severity) query.set('severity', params.severity);
      if (params?.acknowledged !== undefined)
        query.set('acknowledged', params.acknowledged.toString());
      return api.get<{ configurations: AlertConfiguration[]; recentAlerts: AlertHistory[] }>(
        `/api/admin-v2/monitoring/alerts?${query.toString()}`,
      );
    },
  },

  // ==========================================
  // Control (Super Admin only)
  // ==========================================
  control: {
    pm2: {
      restart: (processName?: string) =>
        api.post<{ success: boolean; message: string; output: string }>(
          '/api/admin-v2/control/pm2/restart',
          { processName },
        ),

      reload: (processName?: string) =>
        api.post<{ success: boolean; message: string; output: string }>(
          '/api/admin-v2/control/pm2/reload',
          { processName },
        ),

      getLogs: (params?: { lines?: number; type?: 'out' | 'error' }) => {
        const query = new URLSearchParams();
        if (params?.lines) query.set('lines', params.lines.toString());
        if (params?.type) query.set('type', params.type);
        return api.get<{ logs: string[] }>(`/api/admin-v2/control/pm2/logs?${query.toString()}`);
      },
    },

    cache: {
      flush: (pattern?: string) =>
        api.post<{ success: boolean; message: string; keysDeleted?: number }>(
          '/api/admin-v2/control/cache/flush',
          { pattern },
        ),
    },

    maintenance: {
      set: (enabled: boolean, message?: string) =>
        api.post<{ success: boolean; maintenanceMode: boolean; message?: string }>(
          '/api/admin-v2/control/maintenance',
          { enabled, message },
        ),
    },
  },

  // ==========================================
  // Two-Factor Authentication
  // ==========================================
  twoFactor: {
    generate: () =>
      api.get<{ secret: string; qrCode: string; message: string }>('/api/admin-v2/2fa/generate'),

    enable: (token: string) =>
      api.post<{ success: boolean; message: string }>('/api/admin-v2/2fa/enable', { token }),

    disable: (token: string) =>
      api.post<{ success: boolean; message: string }>('/api/admin-v2/2fa/disable', { token }),

    getStatus: () => api.get<{ enabled: boolean; required: boolean }>('/api/admin-v2/2fa/status'),
  },

  // ==========================================
  // Backup
  // ==========================================
  backup: {
    list: () => api.get<{ backups: Backup[] }>('/api/admin-v2/backup/list'),

    create: () =>
      api.post<{
        backup: { id: string; filename: string; size: number; storage_location: string };
      }>('/api/admin-v2/backup/create'),

    restore: (backupId: string) =>
      api.post<{ message: string }>(`/api/admin-v2/backup/restore/${backupId}`),

    delete: (backupId: string) =>
      api.delete<{ message: string }>(`/api/admin-v2/backup/${backupId}`),
  },

  // ==========================================
  // Security
  // ==========================================
  security: {
    getOverview: () => api.get<SecurityOverview>('/api/admin-v2/security/overview'),

    getLogs: (params?: {
      event_type?: string;
      severity?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.event_type) query.set('event_type', params.event_type);
      if (params?.severity) query.set('severity', params.severity);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      return api.get<SecurityLogsResponse>(`/api/admin-v2/security/logs?${query.toString()}`);
    },

    getSessions: () => api.get<{ sessions: SecuritySession[] }>('/api/admin-v2/security/sessions'),

    revokeSession: (sessionId: string) =>
      api.delete<{ success: boolean }>(`/api/admin-v2/security/sessions/${sessionId}`),

    getIPWhitelist: () =>
      api.get<{ whitelist: IPWhitelistEntry[] }>('/api/admin-v2/security/ip-whitelist'),

    addToIPWhitelist: (data: { ip_address: string; description?: string }) =>
      api.post<{ entry: IPWhitelistEntry }>('/api/admin-v2/security/ip-whitelist', data),

    removeFromIPWhitelist: (id: string) =>
      api.delete<{ success: boolean }>(`/api/admin-v2/security/ip-whitelist/${id}`),
  },

  // ==========================================
  // Alerts (under /monitoring/)
  // ==========================================
  alerts: {
    check: () => api.get<AlertCheckResponse>('/api/admin-v2/monitoring/alerts/check'),

    getConfigurations: () =>
      api.get<AlertConfigurationsResponse>('/api/admin-v2/monitoring/alerts/configurations'),

    createConfiguration: (data: CreateAlertConfigRequest) =>
      api.post<{ configuration: AlertConfigurationItem }>(
        '/api/admin-v2/monitoring/alerts/configurations',
        data,
      ),

    updateConfiguration: (id: string, data: Partial<CreateAlertConfigRequest>) =>
      api.put<{ configuration: AlertConfigurationItem }>(
        `/api/admin-v2/monitoring/alerts/configurations/${id}`,
        data,
      ),

    deleteConfiguration: (id: string) =>
      api.delete<{ success: boolean }>(`/api/admin-v2/monitoring/alerts/configurations/${id}`),

    acknowledge: (alertId: string) =>
      api.post<{ success: boolean }>(`/api/admin-v2/monitoring/alerts/${alertId}/acknowledge`),

    snooze: (alertId: string, minutes: number) =>
      api.post<{ success: boolean; snoozed_until: string }>(
        `/api/admin-v2/monitoring/alerts/${alertId}/snooze`,
        { minutes },
      ),

    getHistory: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      return api.get<AlertHistoryResponseType>(
        `/api/admin-v2/monitoring/alerts/history?${query.toString()}`,
      );
    },
  },

  // ==========================================
  // Metrics (under /monitoring/)
  // ==========================================
  metrics: {
    getCurrent: () =>
      api.get<{ data: CurrentMetricsData }>('/api/admin-v2/monitoring/metrics/current'),

    getHistory: (hours?: number) => {
      const query = new URLSearchParams();
      if (hours) query.set('hours', hours.toString());
      return api.get<{ data: MetricsSnapshotData[] }>(
        `/api/admin-v2/monitoring/metrics/history?${query.toString()}`,
      );
    },

    capture: () => api.post<{ success: boolean }>('/api/admin-v2/monitoring/metrics/capture'),
  },

  // ==========================================
  // Query Analytics
  // ==========================================
  queryAnalytics: {
    getSlowQueries: (limit?: number) => {
      const query = new URLSearchParams();
      if (limit) query.set('limit', limit.toString());
      return api.get<{ queries: SlowQueryData[] }>(
        `/api/admin-v2/query-analytics/slow-queries?${query.toString()}`,
      );
    },

    getFrequentQueries: (limit?: number) => {
      const query = new URLSearchParams();
      if (limit) query.set('limit', limit.toString());
      return api.get<{ queries: FrequentQueryData[] }>(
        `/api/admin-v2/query-analytics/frequent-queries?${query.toString()}`,
      );
    },

    explain: (queryText: string) =>
      api.post<{ plan: unknown }>('/api/admin-v2/query-analytics/explain', { query: queryText }),

    getRecommendations: () =>
      api.get<{ recommendations: QueryRecommendationData[]; count: number }>(
        '/api/admin-v2/query-analytics/recommendations',
      ),

    resetStats: () =>
      api.post<{ success: boolean; message: string }>('/api/admin-v2/query-analytics/reset-stats'),
  },

  // ==========================================
  // Indexes
  // ==========================================
  indexes: {
    list: () => api.get<{ indexes: IndexData[] }>('/api/admin-v2/indexes/list'),

    create: (data: { table: string; column: string; name: string }) =>
      api.post<{ success: boolean }>('/api/admin-v2/indexes/create', data),
  },

  // ==========================================
  // Maintenance
  // ==========================================
  maintenance: {
    vacuum: (tableName?: string) =>
      api.post<{ success: boolean; message: string }>('/api/admin-v2/maintenance/vacuum', {
        tableName,
      }),

    analyze: (tableName?: string) =>
      api.post<{ success: boolean; message: string }>('/api/admin-v2/maintenance/analyze', {
        tableName,
      }),
  },

  // ==========================================
  // Legacy Recovery (Khôi phục thành viên cũ)
  // ==========================================
  legacyRecovery: {
    /**
     * Get recovery statistics
     * Lấy thống kê khôi phục
     */
    getStats: () => api.get<RecoveryStatsData>('/api/admin-v2/legacy-recovery/stats'),

    /**
     * Get detailed summary
     * Lấy tóm tắt chi tiết
     */
    getSummary: () => api.get<RecoverySummaryData>('/api/admin-v2/legacy-recovery/summary'),

    /**
     * Get list of restored members
     * Lấy danh sách thành viên đã khôi phục
     */
    getRestored: (page = 1, limit = 20) =>
      api.get<LegacyMembersData>(
        `/api/admin-v2/legacy-recovery/restored?page=${page}&limit=${limit}`,
      ),

    /**
     * Get list of not restored members
     * Lấy danh sách thành viên chưa khôi phục
     */
    getNotRestored: (page = 1, limit = 20) =>
      api.get<LegacyMembersData>(
        `/api/admin-v2/legacy-recovery/not-restored?page=${page}&limit=${limit}`,
      ),

    /**
     * Search members by email/phone/name
     * Tìm kiếm thành viên theo email/phone/name
     */
    search: (query: string) =>
      api.get<LegacyMembersData>(
        `/api/admin-v2/legacy-recovery/search?q=${encodeURIComponent(query)}`,
      ),

    /**
     * Get single member by email
     * Lấy thông tin một thành viên theo email
     */
    getMember: (email: string) =>
      api.get<LegacyMemberData>(
        `/api/admin-v2/legacy-recovery/member/${encodeURIComponent(email)}`,
      ),
  },

  // ==========================================
  // Top Holders (Quản lý top holders)
  // ==========================================
  topHolders: {
    /**
     * Get asset totals summary
     * Lấy tổng hợp tài sản
     */
    getTotals: () => api.get<AssetTotalsData>('/api/admin-v2/top-holders/totals'),

    /**
     * Get top holders list
     * Lấy danh sách top holders
     */
    getList: (limit = 100, sortBy: 'shares' | 'ogn' | 'tor' | 'total' = 'total') => {
      const query = new URLSearchParams();
      query.set('limit', limit.toString());
      query.set('sortBy', sortBy);
      return api.get<TopHoldersListData>(`/api/admin-v2/top-holders/list?${query.toString()}`);
    },

    /**
     * Get distribution by rank
     * Lấy phân phối theo cấp bậc
     */
    getDistribution: () =>
      api.get<RankDistributionData[]>('/api/admin-v2/top-holders/distribution'),

    /**
     * Get concentration metrics
     * Lấy chỉ số tập trung
     */
    getConcentration: () => api.get<ConcentrationData>('/api/admin-v2/top-holders/concentration'),

    /**
     * Search holders
     * Tìm kiếm holders
     */
    search: (query: string) =>
      api.get<TopHoldersListData>(
        `/api/admin-v2/top-holders/search?q=${encodeURIComponent(query)}`,
      ),

    /**
     * Get single holder detail
     * Lấy chi tiết một holder
     */
    getHolder: (userId: string) =>
      api.get<HolderDetailData>(`/api/admin-v2/top-holders/holder/${userId}`),
  },

  // ==========================================
  // Email Changes (Quản lý khôi phục email)
  // ==========================================
  emailChanges: {
    getStats: () => api.get<EmailChangesStatsData>('/api/admin-v2/email-changes/stats'),

    getList: (params?: EmailChangesListParams) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      if (params?.sortBy) query.set('sortBy', params.sortBy);
      if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
      return api.get<EmailChangeRequest[]>(`/api/admin-v2/email-changes?${query.toString()}`);
    },

    getDetail: (id: number) => api.get<EmailChangeDetailData>(`/api/admin-v2/email-changes/${id}`),

    dispute: (id: number, reason: string) =>
      api.post<{ message: string }>(`/api/admin-v2/email-changes/${id}/dispute`, { reason }),

    cancel: (id: number, note?: string) =>
      api.post<{ message: string }>(`/api/admin-v2/email-changes/${id}/cancel`, { note }),

    getLockedAttempts: () =>
      api.get<LockedAttemptData[]>('/api/admin-v2/email-changes/locked-attempts'),

    unlock: (phone: string) =>
      api.post<{ message: string }>(`/api/admin-v2/email-changes/unlock/${phone}`),
  },

  // ==========================================
  // File Manager (Quản lý file source code)
  // ==========================================
  files: {
    /**
     * Get file tree structure
     * Lấy cấu trúc cây thư mục
     */
    getTree: (path?: string, depth: number = 3) => {
      const query = new URLSearchParams();
      if (path) query.set('path', path);
      query.set('depth', depth.toString());
      return api.get<FileTreeNode[]>(`/api/admin-v2/files/tree?${query.toString()}`);
    },

    /**
     * Read file content
     * Đọc nội dung file
     */
    readFile: (filePath: string) => api.post<FileContent>('/api/admin-v2/files/read', { filePath }),

    /**
     * Search files by name or path
     * Tìm kiếm file theo tên hoặc đường dẫn
     */
    search: (query: string) =>
      api.get<FileSearchResult>(`/api/admin-v2/files/search?q=${encodeURIComponent(query)}`),

    /**
     * Update file description (Vietnamese)
     * Cập nhật mô tả tiếng Việt cho file
     */
    updateDescription: (filePath: string, descriptionVi: string) =>
      api.put<{ success: boolean }>('/api/admin-v2/files/descriptions', {
        filePath,
        descriptionVi,
      }),

    /**
     * Get file stats
     * Lấy thông tin chi tiết file (size, lines, modified date, risk level)
     */
    getStats: (filePath: string) =>
      api.get<FileStats>(`/api/admin-v2/files/stats/${encodeURIComponent(filePath)}`),

    /**
     * Get code health report
     * Lấy báo cáo sức khỏe code (large files, heavy files, health score)
     */
    getHealthReport: () => api.get<CodeHealthData>('/api/admin-v2/files/health-report'),
  },
};

// ============================================
// Type Definitions for Admin V2 API
// ============================================

export interface AdminLoginResponse {
  admin: {
    id: string;
    email: string;
    role: 'super_admin' | 'admin' | 'editor';
    twoFactorEnabled: boolean;
    permissions?: Record<string, boolean>;
  };
  token: string;
  expiresAt: string;
  requires2FA?: boolean;
}

export interface AdminUser {
  id: string;
  userId: string;
  email?: string;
  name?: string;
  adminRole: 'super_admin' | 'admin' | 'editor';
  customPermissions?: Record<string, boolean>;
  twoFactorEnabled: boolean;
  ipWhitelist?: string[];
  lastLoginAt?: string;
  lastLoginIp?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRequest {
  userEmail: string;
  adminRole: 'super_admin' | 'admin' | 'editor';
  customPermissions?: Record<string, boolean>;
  ipWhitelist?: string[];
}

export interface UpdateAdminRequest {
  adminRole?: 'super_admin' | 'admin' | 'editor';
  customPermissions?: Record<string, boolean>;
  isActive?: boolean;
  ipWhitelist?: string[];
}

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
  name: string;
  pmId: number;
  status: 'online' | 'stopped' | 'errored';
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
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
  memory: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  keys: number;
  clients: {
    connected: number;
  };
  stats: {
    commands: number;
    hits: number;
    misses: number;
  };
}

export interface AlertConfiguration {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  comparison: '>' | '<' | '>=' | '<=' | '==';
  severity: 'info' | 'warning' | 'critical';
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

export interface AlertHistory {
  id: string;
  configId?: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  emailSent: boolean;
  slackSent: boolean;
  createdAt: string;
}

// ============================================
// Legacy Recovery Types
// ============================================

export interface LegacyMemberData {
  id: string;
  name: string;
  email: string;
  phone: string;
  pid: string;
  dob: string;
  joined: string;
  rank: string;
  shares: number;
  ogn: number;
  tor: number;
  f1_total: number;
  f1s: string[];
}

export interface RecoveryStatsData {
  total: number;
  restored: number;
  notRestored: number;
  recoveryRate: number;
  lastUpdated: string;
}

export interface RecoverySummaryData {
  byRank: Record<string, number>;
  byMonth: Record<string, number>;
  topF1Leaders: Array<{
    email: string;
    name: string;
    f1_total: number;
  }>;
  recentJoins: LegacyMemberData[];
}

export interface LegacyMembersData {
  members: LegacyMemberData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Top Holders Types (camelCase to match backend response)
// ============================================

export interface AssetTotalsData {
  totalShares: number;
  totalOgn: number;
  totalTor: number;
  totalHolders: number;
  sharesHolders: number;
  ognHolders: number;
  torHolders: number;
  avgShares?: number;
  avgOgn?: number;
  avgTor?: number;
}

export interface TopHolderData {
  rank: number;
  id: string;
  email: string;
  name: string;
  shares: number;
  ogn: number;
  tor: number;
  totalAssets: number;
  legacyRank: string;
  createdAt: string;
}

export interface TopHoldersListData {
  holders: TopHolderData[];
  count: number;
}

export interface RankDistributionData {
  rank: string;
  count: number;
  totalShares: number;
  totalOgn: number;
  totalTor: number;
  percentage: number;
}

export interface ConcentrationData {
  // Overall concentration (tổng hợp)
  top10Percentage: number;
  top50Percentage: number;
  top100Percentage: number;
  // Per-asset breakdown (theo từng loại tài sản)
  top10Shares: number;
  top10Ogn: number;
  top10Tor: number;
  top50Shares: number;
  top50Ogn: number;
  top50Tor: number;
  top100Shares: number;
  top100Ogn: number;
  top100Tor: number;
}

export interface HolderDetailData extends TopHolderData {
  percentOfShares: number;
  percentOfOgn: number;
  percentOfTor: number;
  joinedDate?: string;
  lastActive?: string;
}

// ============================================
// File Manager Types
// ============================================

export interface FileTreeNode {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  descriptionVi: string;
  extension?: string;
  children?: FileTreeNode[];
}

export interface FileContent {
  content: string;
  extension: string;
  lines: number;
}

export interface FileSearchResult {
  files: FileTreeNode[];
  total: number;
}

export interface FileStats {
  size: number;
  sizeFormatted: string;
  lines: number;
  modifiedAt: string;
  createdAt: string;
  extension: string;
  language: string;
  isLarge: boolean;
  isHeavy: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  path: string;
}

export interface CodeHealthData {
  totalFiles: number;
  totalLines: number;
  totalSize: number;
  totalSizeFormatted: string;
  largeFiles: Array<{
    path: string;
    lines: number;
    size: number;
    sizeFormatted: string;
    riskLevel: string;
  }>;
  heavyFiles: Array<{
    path: string;
    size: number;
    sizeFormatted: string;
  }>;
  filesByExtension: Record<string, { count: number; totalLines: number }>;
  summary: {
    avgLinesPerFile: number;
    filesOver400Lines: number;
    filesOver50KB: number;
    healthScore: number;
    healthLabel: string;
  };
}

// ============================================
// Email Changes Types
// ============================================

export type EmailChangeStatus = 'pending' | 'completed' | 'disputed' | 'cancelled';

export interface EmailChangeRequest {
  id: number;
  legacyEmail: string | null;
  oldEmail: string;
  newEmail: string;
  verifiedByCccd: string;
  phone: string;
  userName: string | null;
  status: EmailChangeStatus;
  ipAddress: string | null;
  userAgent: string | null;
  requestedAt: string;
  effectiveAt: string | null;
  completedAt: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailChangesListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface EmailChangesStatsData {
  total: number;
  pending: number;
  completed: number;
  disputed: number;
  cancelled: number;
  lockedPhones: number;
  todayRequests: number;
  thisWeekRequests: number;
}

export interface EmailChangeDetailData extends EmailChangeRequest {
  legacyUserData: {
    name: string;
    phone: string;
    dob: string;
    pid: string;
    email: string;
    rank: string;
    shares: number;
    ogn: number;
    tor: number;
    f1_total: number;
  } | null;
  timeline: Array<{
    time: string;
    event: string;
    detail: string;
  }>;
  verifyAttempts: Array<{
    attemptedAt: string;
    success: boolean;
    ipAddress: string | null;
  }>;
}

export interface LockedAttemptData {
  phone: string;
  ipAddress: string | null;
  attemptCount: number;
  firstAttempt: string;
  lastAttempt: string;
  attempts: Array<{
    attemptedAt: string;
    ipAddress: string | null;
  }>;
}

// ============================================
// Conversion Admin API (Đổi Điểm)
// ============================================

import type {
  ConversionStatsData,
  ConversionListResponse,
  ConversionListParams,
  LeaderboardEntry,
  ConversionAlertsResponse,
  ConversionAlertParams,
  UserAuditData,
  FailedAttemptsResponse,
  FailedAttemptsParams,
  AdminLogsResponse,
} from '@/types/conversion';

export const conversionAdminApi = {
  // Dashboard
  getStats: () => api.get<ConversionStatsData>('/api/admin/conversion/stats'),

  getLeaderboard: (limit = 20) =>
    api.get<{ leaderboard: LeaderboardEntry[] }>(
      `/api/admin/conversion/leaderboard?limit=${limit}`,
    ),

  // Transactions
  getList: (params: ConversionListParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.userId) query.set('userId', params.userId);
    if (params.direction) query.set('direction', params.direction);
    if (params.tierId) query.set('tierId', params.tierId.toString());
    if (params.status) query.set('status', params.status);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.ipAddress) query.set('ipAddress', params.ipAddress);
    return api.get<ConversionListResponse>(`/api/admin/conversion/list?${query.toString()}`);
  },

  // User Audit
  getUserAudit: (userId: string, page = 1, limit = 50) =>
    api.get<UserAuditData>(`/api/admin/conversion/user/${userId}?page=${page}&limit=${limit}`),

  // Freeze / Unfreeze
  freezeUser: (targetUserId: string, reason: string) =>
    api.post<{ message: string }>('/api/admin/conversion/freeze-user', {
      targetUserId,
      reason,
    }),

  unfreezeUser: (targetUserId: string, reason: string) =>
    api.post<{ message: string }>('/api/admin/conversion/unfreeze-user', {
      targetUserId,
      reason,
    }),

  freezeSystem: (reason: string) =>
    api.post<{ message: string }>('/api/admin/conversion/freeze-system', {
      reason,
    }),

  unfreezeSystem: (reason: string) =>
    api.post<{ message: string }>('/api/admin/conversion/unfreeze-system', {
      reason,
    }),

  // Alerts
  getAlerts: (params: ConversionAlertParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.severity) query.set('severity', params.severity);
    if (params.alertType) query.set('alertType', params.alertType);
    return api.get<ConversionAlertsResponse>(`/api/admin/conversion/alerts?${query.toString()}`);
  },

  dismissAlert: (alertId: string, note: string) =>
    api.post<{ message: string }>(`/api/admin/conversion/alerts/${alertId}/dismiss`, { note }),

  escalateAlert: (alertId: string, note: string) =>
    api.post<{ message: string }>(`/api/admin/conversion/alerts/${alertId}/escalate`, { note }),

  // Logs
  getFailedAttempts: (params: FailedAttemptsParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.userId) query.set('userId', params.userId);
    if (params.failReason) query.set('failReason', params.failReason);
    if (params.ipAddress) query.set('ipAddress', params.ipAddress);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    return api.get<FailedAttemptsResponse>(
      `/api/admin/conversion/failed-attempts?${query.toString()}`,
    );
  },

  getAdminLogs: (page = 1, limit = 50) =>
    api.get<AdminLogsResponse>(`/api/admin/conversion/admin-logs?page=${page}&limit=${limit}`),

  // Actions
  runAlertScan: () =>
    api.post<{ message: string; alertsCreated: number }>('/api/admin/conversion/run-alert-scan'),
};

// ============================================
// Delivery Admin API (Quan ly Giao hang)
// ============================================

import type {
  AdminClaimedSlot,
  DeliveryBatch,
  CreateBatchRequest,
  CreateBatchResult,
  GeneratePdfResult,
} from '@/types/delivery';

export const deliveryAdminApi = {
  /** Lay danh sach slots da claimed (cho admin chon) */
  getClaimedSlots: (monthYear?: string) => {
    const query = new URLSearchParams();
    if (monthYear) query.set('monthYear', monthYear);
    const qs = query.toString();
    return api.get<AdminClaimedSlot[]>(
      `/api/rwa/delivery/admin/claimed-slots${qs ? `?${qs}` : ''}`,
    );
  },

  /** Tao lo giao hang */
  createBatch: (data: CreateBatchRequest) =>
    api.post<CreateBatchResult>('/api/rwa/delivery/admin/create-batch', data),

  /** Generate PDF phieu giao hang */
  generatePdf: (batchId: string) =>
    api.post<GeneratePdfResult>(`/api/rwa/delivery/admin/batch/${batchId}/generate-pdf`, {}),

  /** Lay danh sach lo da tao */
  getBatches: (limit = 20) =>
    api.get<DeliveryBatch[]>(`/api/rwa/delivery/admin/batches?limit=${limit}`),

  /** Download PDF - dung fetch + blob vi can auth cookie */
  downloadPdf: async (batchId: string, batchNumber: string) => {
    const response = await fetch(`${API_BASE}/api/rwa/delivery/admin/batch/${batchId}/labels.pdf`, {
      credentials: 'include',
    });

    if (response.status === 401) {
      throw new Error('Phien dang nhap het han. Vui long dang nhap lai.');
    }
    if (!response.ok) {
      throw new Error('Tai PDF that bai');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phieu-giao-hang-${batchNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ============================================
// Topup Admin API (Quan ly Nap AVAX)
// ============================================

import type {
  TopupOrderListParams,
  TopupOrderListResponse,
  TopupStatsData,
  TopupOrder,
  TopupPackage,
  HotWalletInfo,
  TopupTransactionsResponse,
} from '@/types/topup';

export const topupAdminApi = {
  /** Lay thong ke tong quan */
  getStats: () => api.get<TopupStatsData>('/api/admin/topup/stats'),

  /** Lay danh sach orders (tat ca users) */
  getOrders: (params: TopupOrderListParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.userId) query.set('userId', params.userId);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    return api.get<TopupOrderListResponse>(`/api/admin/topup/orders?${query.toString()}`);
  },

  /** Lay chi tiet 1 order */
  getOrder: (orderId: string) => api.get<TopupOrder>(`/api/admin/topup/orders/${orderId}`),

  /** Retry chuyen AVAX cho order bi failed */
  retryTransfer: (orderId: string) =>
    api.post<{ message: string; txHash?: string }>(`/api/admin/topup/orders/${orderId}/retry`),

  /** Lay danh sach packages (public) */
  getPackages: () => api.get<TopupPackage[]>('/api/topup/packages'),

  /** Lay gia AVAX hien tai (public) */
  getAvaxPrice: () =>
    api.get<{ usd: number; vnd: number; updatedAt: number; stale: boolean }>('/api/topup/price'),

  /** Hot wallet info + balance */
  getWalletInfo: () => api.get<HotWalletInfo>('/api/admin/topup/wallet'),

  /** Lich su giao dich chuyen AVAX */
  getTransactions: (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    return api.get<TopupTransactionsResponse>(`/api/admin/topup/transactions?${query}`);
  },
};

// ============================================
// World Boss Admin API
// ============================================

import type {
  WorldBossCurrent,
  WorldBossHistoryEntry,
  AdminCreateBossPayload,
  AdminCreateResponse,
  BossDetailResponse,
  NftEventCard,
} from '@/types/world-boss';

export const worldBossApi = {
  getCurrent: () => api.get<WorldBossCurrent>('/api/world-boss/current'),

  getHistory: (limit = 20) =>
    api.get<{ bosses: WorldBossHistoryEntry[] }>(`/api/world-boss/history?limit=${limit}`),

  getLeaderboard: (eventId: string, top = 20) =>
    api.get<{ source: string; leaderboard: unknown[] }>(
      `/api/world-boss/leaderboard/${eventId}?top=${top}`,
    ),

  adminCreate: (body: AdminCreateBossPayload) =>
    api.post<AdminCreateResponse>('/api/world-boss/admin-create', body),

  adminEnd: (eventId: string, reason: 'defeated' | 'expired' | 'manual' = 'manual') =>
    api.post<{ success: boolean; totalParticipants: number; rewardsDistributed: number }>(
      `/api/world-boss/end/${eventId}`,
      { reason },
    ),

  getAdminDetail: (eventId: string) =>
    api.get<BossDetailResponse>(`/api/world-boss/admin/detail/${eventId}`),
};

export const nftApi = {
  getEventCards: (eventId: string) =>
    api.get<{ ok: boolean; eventId: string; cards: NftEventCard[] }>(`/api/nft/event/${eventId}`),
};

// ═══ Marketplace Admin API ═══
export interface MarketplaceStats {
  active_count: string;
  sold_count: string;
  cancelled_count: string;
  total_volume_avax: string;
  total_count: string;
}

export interface MarketplaceListing {
  id: string;
  seller_user_id: string;
  buyer_user_id: string | null;
  token_id: number;
  event_id: string | null;
  price_avax: string;
  status: string;
  listed_at: string;
  sold_at: string | null;
  cancelled_at: string | null;
  sold_tx_hash: string | null;
  nft_tx_hash: string | null;
  seller_name: string | null;
  buyer_name: string | null;
  nft_card_type: string | null;
  nft_card_image_url: string | null;
  boss_name: string | null;
  boss_difficulty: string | null;
  boss_element: string | null;
}

export interface MarketplaceWithdrawal {
  id: number;
  user_id: string;
  token_id: number;
  to_address: string;
  tx_hash: string | null;
  created_at: string;
  user_name: string | null;
}

export const marketplaceAdminApi = {
  getStats: () => api.get<{ ok: boolean; stats: MarketplaceStats }>('/api/marketplace/admin/stats'),

  getListings: (status?: string) => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return api.get<{ ok: boolean; listings: MarketplaceListing[] }>(
      `/api/marketplace/admin/all${query}`,
    );
  },

  forceCancel: (id: string) =>
    api.delete<{ ok: boolean }>(`/api/marketplace/admin/force-cancel/${id}`),

  getWithdrawals: () =>
    api.get<{ ok: boolean; withdrawals: MarketplaceWithdrawal[] }>(
      '/api/marketplace/admin/withdrawals',
    ),
};
