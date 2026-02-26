import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopupStatsCards, TopupRecentTable, TopupOrderDetailDialog } from '@/components/topup';
import {
  useTopupStats,
  useTopupOrders,
  useAvaxPrice,
  useRetryTopupTransfer,
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
  const retryMutation = useRetryTopupTransfer();

  const stats = statsResponse?.data;
  const recentOrders = ordersResponse?.data?.orders || [];
  const avaxPrice = priceResponse?.data?.usd;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['topup-stats'] });
    queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
    queryClient.invalidateQueries({ queryKey: ['avax-price'] });
  };

  const handleRetry = async (order: TopupOrder) => {
    try {
      const result = await retryMutation.mutateAsync(order.id);
      if (result.success) {
        toast.success('Retry thanh cong!');
        setSelectedOrder(null);
      } else {
        toast.error(result.error?.message || 'Retry that bai');
      }
    } catch {
      toast.error('Co loi xay ra khi retry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nap AVAX — Tong Quan</h1>
          <p className="text-gray-500">Quan ly he thong nap AVAX qua Stripe</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Lam moi
        </Button>
      </div>

      {/* Stats Cards */}
      <TopupStatsCards data={stats} isLoading={statsLoading} />

      {/* AVAX Price Info */}
      {avaxPrice && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Gia AVAX hien tai:</span>
            <span className="font-bold text-lg">${avaxPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

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
