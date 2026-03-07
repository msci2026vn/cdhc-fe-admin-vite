import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopupFilters, TopupOrdersTable, TopupOrderDetailDialog } from '@/components/topup';
import { Pagination } from '@/components/users/Pagination';
import { useTopupOrders, useRetryTopupTransfer } from '@/hooks/useTopup';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { TopupOrder } from '@/types/topup';

export default function TopupOrderListPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<TopupOrder | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState('all');
  const [userId, setUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: ordersResponse, isLoading } = useTopupOrders({
    page,
    limit,
    status: status !== 'all' ? status : undefined,
    userId: userId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const retryMutation = useRetryTopupTransfer();

  const orders = ordersResponse?.data?.orders || [];
  const pagination = ordersResponse?.data?.pagination;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
  };

  const handleReset = () => {
    setPage(1);
    setStatus('all');
    setUserId('');
    setDateFrom('');
    setDateTo('');
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
          <h1 className="text-2xl font-bold">Danh sách Topup Orders</h1>
          <p className="text-gray-500">Tất cả orders nạp AVAX của mọi user</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Lam moi
        </Button>
      </div>

      {/* Filters */}
      <TopupFilters
        status={status}
        userId={userId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onUserIdChange={(v) => {
          setUserId(v);
          setPage(1);
        }}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Orders Table */}
      <TopupOrdersTable
        orders={orders}
        isLoading={isLoading}
        onViewDetail={setSelectedOrder}
        onRetry={handleRetry}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={(v) => {
            setLimit(v);
            setPage(1);
          }}
        />
      )}

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
