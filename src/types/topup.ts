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

// Matches BE getTopupOrders() response (topup.admin.service.ts)
export interface TopupOrder {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  packageId: string;
  avaxAmount: string; // varchar in DB
  avaxPriceUsd: string; // varchar in DB
  fiatAmountUsd: number; // integer cents
  fiatAmountVnd: number; // integer
  paymentMethod: string;
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  txHash: string | null;
  status: TopupOrderStatus;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

// Matches BE getTopupStats() response (topup.admin.service.ts)
export interface TopupStatsData {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  totalAvax: number;
  totalUsdCents: number;
}

export interface TopupPackage {
  id: string;
  name: string;
  avaxAmount: string;
  emoji: string;
  description: string;
  priceUsd: number;
  priceUsdCents: number;
  priceVnd: number;
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

// Matches BE getHotWalletInfo() response
export interface HotWalletInfo {
  address: string;
  balanceAvax: number;
  balanceUsd: number;
  balanceVnd: number;
  balanceStatus: 'ok' | 'warning' | 'critical';
  totalTransferredAvax: number;
  totalCompletedTx: number;
  totalFailedTx: number;
  avaxPriceUsd: number;
  thresholds: {
    warning: number;
    critical: number;
  };
}

// Matches BE getTopupTransactions() response
export interface TopupTransaction {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  avaxAmount: string;
  fiatAmountUsd: number;
  txHash: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  metadata: Record<string, unknown> | null;
}

export interface TopupTransactionsResponse {
  transactions: TopupTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
