import { ExternalLink, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import type { TopupOrder } from '@/types/topup';
import { TOPUP_STATUS_LABELS, TOPUP_STATUS_VARIANTS } from '@/types/topup';

interface Props {
  order: TopupOrder | null;
  open: boolean;
  onClose: () => void;
  onRetry?: (order: TopupOrder) => void;
  retrying?: boolean;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-medium text-right max-w-[60%] break-all ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value ?? '-'}
      </span>
    </div>
  );
}

function TimelineItem({
  label,
  time,
  active,
}: {
  label: string;
  time: string | null;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
      <div className="flex-1">
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs text-gray-500">{time ? formatDate(time) : '-'}</span>
    </div>
  );
}

export function TopupOrderDetailDialog({ order, open, onClose, onRetry, retrying }: Props) {
  if (!order) return null;

  const explorerBase = order.txHash?.startsWith('0x')
    ? 'https://snowtrace.io/tx'
    : 'https://testnet.snowtrace.io/tx';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiet Order
            <Badge variant={TOPUP_STATUS_VARIANTS[order.status]}>
              {TOPUP_STATUS_LABELS[order.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Thong tin user</h4>
            <div className="rounded border p-3">
              <DetailRow label="User ID" value={order.userId} mono />
              <DetailRow label="Ten" value={order.userName} />
              <DetailRow label="Email" value={order.userEmail} />
            </div>
          </div>

          {/* Package Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Goi nap</h4>
            <div className="rounded border p-3">
              <DetailRow label="Goi" value={order.packageId} />
              <DetailRow label="AVAX" value={`${order.avaxAmount} AVAX`} />
              <DetailRow label="USD" value={`$${((order.fiatAmountUsd ?? 0) / 100).toFixed(2)}`} />
              {order.fiatAmountVnd != null && (
                <DetailRow label="VND" value={`${order.fiatAmountVnd.toLocaleString('vi-VN')}d`} />
              )}
              <DetailRow label="Gia AVAX luc mua" value={`$${order.avaxPriceUsd}`} />
            </div>
          </div>

          {/* Payment Info */}
          {order.paymentMethod === 'paypal' ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  PayPal
                </span>
              </h4>
              <div className="rounded border p-3">
                <DetailRow label="Order ID" value={order.paypalOrderId} mono />
                <DetailRow label="Capture ID" value={order.paypalCaptureId} mono />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-purple-400" />
                  Stripe
                </span>
              </h4>
              <div className="rounded border p-3">
                <DetailRow label="Session ID" value={order.stripeSessionId} mono />
                <DetailRow label="Payment Intent" value={order.stripePaymentIntent} mono />
              </div>
            </div>
          )}

          {/* AVAX Transaction */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">AVAX Transaction</h4>
            <div className="rounded border p-3">
              <DetailRow label="TX Hash" value={order.txHash} mono />
              {order.txHash && (
                <div className="pt-2">
                  <a
                    href={`${explorerBase}/${order.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    Xem tren Snowtrace
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
            <div className="rounded border p-3 space-y-2">
              <TimelineItem label="Tao order" time={order.createdAt} active={!!order.createdAt} />
              <TimelineItem
                label="Hoan thanh"
                time={order.completedAt}
                active={!!order.completedAt}
              />
              <TimelineItem label="Cap nhat" time={order.updatedAt} active={!!order.updatedAt} />
            </div>
          </div>

          {/* Actions */}
          {order.status === 'failed' && onRetry && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onRetry(order)} disabled={retrying}>
                <RotateCw className={`mr-2 h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Dang retry...' : 'Retry chuyen AVAX'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
