import { useState } from 'react';
import { ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTopupTransactions } from '@/hooks/useTopup';
import { useRetryTopupTransfer } from '@/hooks/useTopup';
import { toast } from 'sonner';
import type { TopupOrderStatus } from '@/types/topup';
import { TOPUP_STATUS_LABELS, TOPUP_STATUS_VARIANTS } from '@/types/topup';

const SNOWTRACE_TX = 'https://snowtrace.io/tx';

function truncateHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function formatTime(date: string) {
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'transferring', label: 'Đang chuyển' },
  { value: 'paid', label: 'Đã thanh toán' },
];

export function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 10;

  const { data: response, isLoading } = useTopupTransactions({
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const retryMutation = useRetryTopupTransfer();

  const txs = response?.data?.transactions || [];
  const pagination = response?.data?.pagination;

  const handleRetry = async (orderId: string) => {
    try {
      const result = await retryMutation.mutateAsync(orderId);
      if (result.success) {
        toast.success('Retry thành công!');
      } else {
        toast.error('Retry thất bại');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi retry');
    }
  };

  return (
    <div className="rounded-lg border bg-white">
      {/* Header + Filter */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Lịch sử chuyển AVAX</h3>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">Chưa có giao dịch nào</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">AVAX</TableHead>
                <TableHead className="text-right">USD</TableHead>
                <TableHead>TX Hash</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(tx.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {tx.userName ||
                        (tx.userEmail ? tx.userEmail.split('@')[0] : tx.userId.slice(0, 8) + '...')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">{tx.avaxAmount}</TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    ${(tx.fiatAmountUsd / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {tx.txHash ? (
                      <a
                        href={`${SNOWTRACE_TX}/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {truncateHash(tx.txHash)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {tx.status === 'transferring' ? (
                        <Badge variant={TOPUP_STATUS_VARIANTS[tx.status as TopupOrderStatus]}>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          {TOPUP_STATUS_LABELS[tx.status as TopupOrderStatus]}
                        </Badge>
                      ) : (
                        <Badge variant={TOPUP_STATUS_VARIANTS[tx.status as TopupOrderStatus]}>
                          {TOPUP_STATUS_LABELS[tx.status as TopupOrderStatus]}
                        </Badge>
                      )}
                      {tx.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                          onClick={() => handleRetry(tx.id)}
                          disabled={retryMutation.isPending}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-xs text-gray-500">
                Trang {pagination.page}/{pagination.totalPages} ({pagination.total} giao dịch)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
