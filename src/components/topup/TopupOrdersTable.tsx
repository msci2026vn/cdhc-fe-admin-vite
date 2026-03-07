import { Eye, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { TopupOrder } from '@/types/topup';
import { TOPUP_STATUS_LABELS, TOPUP_STATUS_VARIANTS } from '@/types/topup';

interface Props {
  orders: TopupOrder[];
  isLoading: boolean;
  onViewDetail: (order: TopupOrder) => void;
  onRetry?: (order: TopupOrder) => void;
}

function PaymentMethodBadge({ method }: { method: string }) {
  if (method === 'paypal')
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
        PayPal
      </span>
    );
  if (method === 'stripe')
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
        Stripe
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
      {method}
    </span>
  );
}

export function TopupOrdersTable({ orders, isLoading, onViewDetail, onRetry }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Gói</TableHead>
              <TableHead>AVAX</TableHead>
              <TableHead>USD</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Không có order nào
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Gói</TableHead>
            <TableHead>AVAX</TableHead>
            <TableHead>USD</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, idx) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onViewDetail(order)}
            >
              <TableCell className="font-mono text-xs text-gray-500">{idx + 1}</TableCell>
              <TableCell>
                <div>
                  <div className="text-sm font-medium">
                    {order.userName || order.userId.slice(0, 8) + '...'}
                  </div>
                  {order.userEmail && (
                    <div className="text-xs text-gray-500">{order.userEmail}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">{order.packageId}</TableCell>
              <TableCell className="text-sm font-medium">{order.avaxAmount} AVAX</TableCell>
              <TableCell className="text-sm">
                ${((order.fiatAmountUsd ?? 0) / 100).toFixed(2)}
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={order.paymentMethod} />
              </TableCell>
              <TableCell>
                <Badge variant={TOPUP_STATUS_VARIANTS[order.status]}>
                  {TOPUP_STATUS_LABELS[order.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-gray-500">{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(order);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {order.status === 'failed' && onRetry && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-orange-600 hover:text-orange-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(order);
                      }}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
