import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatNumber, formatDate } from '@/lib/utils';
import type { ConversionRecord } from '@/types/conversion';

interface Props {
  conversion: ConversionRecord | null;
  open: boolean;
  onClose: () => void;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export function ConversionDetailModal({ conversion, open, onClose }: Props) {
  if (!conversion) return null;

  const c = conversion;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết giao dịch
            <Badge variant={c.direction === 'ogn_to_seed' ? 'warning' : 'success'}>
              {c.direction === 'seed_to_ogn' ? 'Seed→OGN' : 'OGN→Seed'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin cơ bản</h4>
            <div className="rounded border p-3">
              <DetailRow label="ID" value={c.id} mono />
              <DetailRow label="User" value={c.userName || c.userId} />
              <DetailRow
                label="Hướng"
                value={c.direction === 'seed_to_ogn' ? 'Seed → OGN' : 'OGN → Seed'}
              />
              <DetailRow label="Mốc (Tier)" value={c.tierId} />
              <DetailRow label="Tỷ giá" value={c.rate} />
              <DetailRow label="Player Level" value={c.playerLevel} />
              <DetailRow label="Trạng thái" value={c.status} />
              <DetailRow label="Thời gian" value={formatDate(c.createdAt)} />
            </div>
          </div>

          {/* Amount */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Số lượng</h4>
            <div className="rounded border p-3">
              <DetailRow label="Gửi" value={`${formatNumber(c.fromAmount)} ${c.fromCurrency}`} />
              <DetailRow
                label="Phí (burn)"
                value={`${formatNumber(c.feeAmount)} ${c.feeCurrency}`}
              />
              <DetailRow label="Nhận" value={`${formatNumber(c.toAmount)} ${c.toCurrency}`} />
            </div>
          </div>

          {/* Balance */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Balance trước/sau</h4>
            <div className="rounded border p-3">
              <DetailRow label="Seed trước" value={formatNumber(c.seedBalanceBefore)} />
              <DetailRow label="Seed sau" value={formatNumber(c.seedBalanceAfter)} />
              <DetailRow label="OGN trước" value={formatNumber(c.ognBalanceBefore)} />
              <DetailRow label="OGN sau" value={formatNumber(c.ognBalanceAfter)} />
            </div>
          </div>

          {/* Technical */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Kỹ thuật</h4>
            <div className="rounded border p-3">
              <DetailRow label="IP" value={c.ipAddress} mono />
              <DetailRow label="Request Hash" value={c.requestHash || '-'} mono />
              <DetailRow label="Idempotency Key" value={c.idempotencyKey || '-'} mono />
              <DetailRow label="Duration" value={`${c.requestDurationMs}ms`} />
              <DetailRow label="User-Agent" value={c.userAgent || '-'} />
            </div>
          </div>

          {/* Metadata */}
          {c.metadata && Object.keys(c.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h4>
              <pre className="rounded border bg-gray-50 p-3 text-xs overflow-x-auto">
                {JSON.stringify(c.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
