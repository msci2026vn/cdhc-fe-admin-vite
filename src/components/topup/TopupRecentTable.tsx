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
  onViewDetail?: (order: TopupOrder) => void;
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

export function TopupRecentTable({ orders, isLoading, onViewDetail }: Props) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Orders gần đây</h3>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">Chưa có order nào</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>AVAX</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={onViewDetail ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => onViewDetail?.(order)}
              >
                <TableCell>
                  <div className="text-sm font-medium">
                    {order.userName || order.userId.slice(0, 8) + '...'}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{order.avaxAmount} AVAX</TableCell>
                <TableCell>
                  <PaymentMethodBadge method={order.paymentMethod} />
                </TableCell>
                <TableCell>
                  <Badge variant={TOPUP_STATUS_VARIANTS[order.status]}>
                    {TOPUP_STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
