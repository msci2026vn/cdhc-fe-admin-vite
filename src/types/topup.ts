// ============================================
// Topup Admin Types
// ============================================

export type TopupOrderStatus =
  | 'pending'
  | 'paid'
  | 'transferring'
  | 'completed'
  | 'failed'
  | 'expired';

export interface TopupOrder {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  packageId: string;
  packageName?: string;
  avaxAmount: number;
  usdAmount: number;
  vndAmount?: number;
  avaxPrice: number;
  status: TopupOrderStatus;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  txHash: string | null;
  walletAddress: string | null;
  failReason: string | null;
  retryCount: number;
  createdAt: string;
  paidAt: string | null;
  transferredAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  expiredAt: string | null;
}

export interface TopupStatsData {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  totalAvaxSent: number;
  totalUsdCollected: number;
  totalVndCollected: number;
  currentAvaxPrice: number;
  todayOrders: number;
  todayAvax: number;
  todayUsd: number;
}

export interface TopupPackage {
  id: string;
  name: string;
  avaxAmount: number;
  icon: string;
  popular?: boolean;
}

export interface TopupOrderListResponse {
  orders: TopupOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TopupOrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const TOPUP_STATUS_LABELS: Record<TopupOrderStatus, string> = {
  pending: 'Cho thanh toan',
  paid: 'Da thanh toan',
  transferring: 'Dang chuyen',
  completed: 'Hoan thanh',
  failed: 'That bai',
  expired: 'Het han',
};

export const TOPUP_STATUS_VARIANTS: Record<
  TopupOrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
> = {
  pending: 'warning',
  paid: 'info',
  transferring: 'info',
  completed: 'success',
  failed: 'destructive',
  expired: 'secondary',
};
