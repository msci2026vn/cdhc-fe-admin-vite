import { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useEmailChangeDetail,
  useDisputeEmailChange,
  useCancelEmailChange,
} from '@/hooks/useEmailChanges';
import { toast } from 'sonner';
import type { EmailChangeStatus } from '@/lib/api';

interface Props {
  requestId: number | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  EmailChangeStatus,
  { label: string; variant: 'warning' | 'success' | 'destructive' | 'secondary' }
> = {
  pending: { label: 'Đang chờ duyệt', variant: 'warning' },
  completed: { label: 'Đã chuyển đổi', variant: 'success' },
  disputed: { label: 'Tranh chấp', variant: 'destructive' },
  cancelled: { label: 'Đã hủy', variant: 'secondary' },
};

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function EmailChangeDetail({ requestId, open, onClose }: Props) {
  const { data: response, isLoading } = useEmailChangeDetail(open ? requestId : null);
  const disputeMutation = useDisputeEmailChange();
  const cancelMutation = useCancelEmailChange();
  const [reason, setReason] = useState('');

  const detail = response?.data;

  const handleDispute = async () => {
    if (!detail || !reason.trim()) {
      toast.error('Vui lòng nhập lý do tranh chấp');
      return;
    }
    try {
      await disputeMutation.mutateAsync({ id: detail.id, reason: reason.trim() });
      toast.success('Đã đánh dấu tranh chấp và rollback');
      setReason('');
      onClose();
    } catch {
      toast.error('Không thể xử lý tranh chấp');
    }
  };

  const handleCancel = async () => {
    if (!detail) return;
    try {
      await cancelMutation.mutateAsync({ id: detail.id, note: reason.trim() || undefined });
      toast.success('Đã hủy yêu cầu');
      setReason('');
      onClose();
    } catch {
      toast.error('Không thể hủy yêu cầu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Chi tiết yêu cầu #{requestId}
            {detail && (
              <Badge variant={STATUS_CONFIG[detail.status]?.variant || 'secondary'}>
                {STATUS_CONFIG[detail.status]?.label || detail.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Request Info */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Thông tin yêu cầu</h3>
              <div className="rounded-lg border bg-gray-50 p-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Họ tên</dt>
                    <dd className="font-medium">{detail.userName || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">SĐT</dt>
                    <dd className="font-mono">{detail.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">CCCD đã xác minh</dt>
                    <dd className="font-mono">{detail.verifiedByCccd}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">IP Address</dt>
                    <dd className="font-mono text-xs">{detail.ipAddress || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email cũ</dt>
                    <dd className="font-medium text-red-600">{detail.oldEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email mới</dt>
                    <dd className="font-medium text-green-600">{detail.newEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Yêu cầu lúc</dt>
                    <dd>{formatDateTime(detail.requestedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Có hiệu lực lúc</dt>
                    <dd>{formatDateTime(detail.effectiveAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Hoàn thành lúc</dt>
                    <dd>{formatDateTime(detail.completedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Thiết bị</dt>
                    <dd className="text-xs truncate" title={detail.userAgent || ''}>
                      {detail.userAgent ? detail.userAgent.slice(0, 60) + '...' : '-'}
                    </dd>
                  </div>
                  {detail.disputeReason && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Lý do tranh chấp</dt>
                      <dd className="text-red-600">{detail.disputeReason}</dd>
                    </div>
                  )}
                  {detail.adminNote && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Ghi chú admin</dt>
                      <dd>{detail.adminNote}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </section>

            {/* Legacy User Data */}
            {detail.legacyUserData && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Thông tin tài khoản gốc (Legacy)
                </h3>
                <div className="rounded-lg border bg-blue-50 p-4">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Họ tên</dt>
                      <dd className="font-medium">{detail.legacyUserData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Cấp bậc</dt>
                      <dd>{detail.legacyUserData.rank || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Cổ phần (CPO)</dt>
                      <dd className="font-mono">{detail.legacyUserData.shares}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Điểm OGN</dt>
                      <dd className="font-mono">{detail.legacyUserData.ogn}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Điểm TOR</dt>
                      <dd className="font-mono">{detail.legacyUserData.tor}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Đồng đội (F1)</dt>
                      <dd className="font-mono">{detail.legacyUserData.f1_total}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Ngày sinh</dt>
                      <dd>{detail.legacyUserData.dob || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">CCCD</dt>
                      <dd className="font-mono">{detail.legacyUserData.pid}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            )}

            {/* Timeline */}
            {detail.timeline.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Timeline sự kiện</h3>
                <div className="rounded-lg border bg-white p-4">
                  <div className="space-y-3">
                    {detail.timeline.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-mono text-gray-400">
                              {formatDateTime(item.time)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{item.event}</p>
                          <p className="text-xs text-gray-500">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Verify Attempts */}
            {detail.verifyAttempts.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Lịch sử xác minh (SĐT: {detail.phone})
                </h3>
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Kết quả</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.verifyAttempts.map((att, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs text-gray-500">{i + 1}</TableCell>
                          <TableCell className="text-xs font-mono">
                            {formatDateTime(att.attemptedAt)}
                          </TableCell>
                          <TableCell>
                            {att.success ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs">
                                <CheckCircle className="h-3 w-3" /> Đúng
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600 text-xs">
                                <XCircle className="h-3 w-3" /> Sai
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {att.ipAddress || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {/* Actions */}
            {(detail.status === 'pending' || detail.status === 'completed') && (
              <section className="border-t pt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Hành động</h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Lý do / Ghi chú</label>
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập lý do..."
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDispute}
                    disabled={disputeMutation.isPending}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {disputeMutation.isPending ? 'Đang xử lý...' : 'Tranh chấp'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {cancelMutation.isPending ? 'Đang xử lý...' : 'Hủy yêu cầu'}
                  </Button>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">Không tìm thấy dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
