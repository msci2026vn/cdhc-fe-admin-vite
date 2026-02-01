export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
  };
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface BulkActionResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    userId: string;
    success: boolean;
    error?: string;
  }>;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: AdminAction;
  targetType: 'user' | 'staff' | 'note';
  targetId: string;
  targetEmail?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export type AdminAction =
  | 'user_view'
  | 'user_approve'
  | 'user_reject'
  | 'user_suspend'
  | 'user_activate'
  | 'user_delete'
  | 'user_update'
  | 'user_bulk_approve'
  | 'user_bulk_reject'
  | 'user_bulk_suspend'
  | 'staff_view'
  | 'staff_create'
  | 'staff_update'
  | 'staff_delete'
  | 'staff_change_role'
  | 'note_create'
  | 'note_update'
  | 'note_delete'
  | 'stats_view'
  | 'stats_refresh'
  | 'login'
  | 'logout';

export interface Note {
  id: string;
  userId: string;
  createdBy: string;
  createdByEmail: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'system'
  | 'account'
  | 'announcement'
  | 'promotion'
  | 'reminder'
  | 'update';
