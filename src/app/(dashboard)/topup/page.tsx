import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TopupStatsCards,
  TopupRecentTable,
  TopupOrderDetailDialog,
  HotWalletCard,
  TransactionsTable,
} from '@/components/topup';
import {
  useTopupStats,
  useTopupOrders,
  useAvaxPrice,
  useRetryTopupTransfer,
  useHotWalletInfo,
} from '@/hooks/useTopup';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TopupOrder } from '@/types/topup';

export default function TopupDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<TopupOrder | null>(null);

  const { data: statsResponse, isLoading: statsLoading } = useTopupStats();
  const { data: ordersResponse, isLoading: ordersLoading } = useTopupOrders({
    page: 1,
    limit: 5,
  });
  const { data: priceResponse } = useAvaxPrice();
  const { data: walletResponse, isLoading: walletLoading } = useHotWalletInfo();
  const retryMutation = useRetryTopupTransfer();

  const stats = statsResponse?.data;
  const recentOrders = ordersResponse?.data?.orders || [];
  const avaxPrice = priceResponse?.data?.usd;
  const walletInfo = walletResponse?.data;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['topup-stats'] });
    queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
    queryClient.invalidateQueries({ queryKey: ['avax-price'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'topup', 'wallet'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'topup', 'transactions'] });
  };

  const handleRetry = async (order: TopupOrder) => {
    try {
      const result = await retryMutation.mutateAsync(order.id);
      if (result.success) {
        toast.success('Retry thành công!');
        setSelectedOrder(null);
      } else {
        toast.error(result.error?.message || 'Retry thất bại');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi retry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nạp AVAX — Tổng Quan</h1>
          <p className="text-gray-500">Quản lý hệ thống nạp AVAX qua Stripe</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Lam moi
        </Button>
      </div>

      {/* Stats Cards */}
      <TopupStatsCards data={stats} isLoading={statsLoading} />

      {/* Hot Wallet Card */}
      <HotWalletCard data={walletInfo} isLoading={walletLoading} />

      {/* AVAX Price Info */}
      {avaxPrice && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Gia AVAX hien tai:</span>
            <span className="font-bold text-lg">${avaxPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <TransactionsTable />

      {/* Recent Orders */}
      <TopupRecentTable
        orders={recentOrders}
        isLoading={ordersLoading}
        onViewDetail={setSelectedOrder}
      />

      {/* Order Detail Dialog */}
      <TopupOrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onRetry={handleRetry}
        retrying={retryMutation.isPending}
      />
    </div>
  );
}
