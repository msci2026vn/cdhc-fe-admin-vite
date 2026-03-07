import { useState } from 'react';
import { Check, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useDismissAlert, useEscalateAlert } from '@/hooks/useConversion';
import type { ConversionAlert } from '@/types/conversion';

interface Props {
  alerts: ConversionAlert[];
  isLoading: boolean;
  onUserClick?: (userId: string) => void;
}

const SEVERITY_CONFIG: Record<
  string,
  { label: string; variant: 'destructive' | 'warning' | 'info' }
> = {
  critical: { label: 'CRITICAL', variant: 'destructive' },
  warning: { label: 'WARNING', variant: 'warning' },
  info: { label: 'INFO', variant: 'info' },
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  velocity_alert: 'Tốc độ cao',
  whale_alert: 'Cá voi',
  spike_alert: 'Đột biến',
  new_user_burst: 'User mới',
  round_trip_alert: 'Vòng tròn',
  balance_mismatch: 'Lệch balance',
  multi_ip_alert: 'Đa IP',
  failed_burst_alert: 'Spam thất bại',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'warning' | 'secondary' | 'destructive' }
> = {
  open: { label: 'Mở', variant: 'warning' },
  dismissed: { label: 'Đã dismiss', variant: 'secondary' },
  escalated: { label: 'Đã escalate', variant: 'destructive' },
};

export function ConversionAlertsTable({ alerts, isLoading, onUserClick }: Props) {
  const [actionDialog, setActionDialog] = useState<{
    type: 'dismiss' | 'escalate';
    alertId: string;
  } | null>(null);
  const [note, setNote] = useState('');

  const dismissAlert = useDismissAlert();
  const escalateAlert = useEscalateAlert();

  const handleAction = async () => {
    if (!actionDialog || note.length < 3) {
      toast.error('Ghi chú phải có ít nhất 3 ký tự');
      return;
    }
    try {
      if (actionDialog.type === 'dismiss') {
        await dismissAlert.mutateAsync({ alertId: actionDialog.alertId, note });
        toast.success('Alert đã được dismiss');
      } else {
        await escalateAlert.mutateAsync({ alertId: actionDialog.alertId, note });
        toast.success('Alert đã được escalate');
      }
      setActionDialog(null);
      setNote('');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mức độ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
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

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Không có cảnh báo nào
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mức độ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const severityCfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
              const statusCfg = STATUS_CONFIG[alert.status] || STATUS_CONFIG.open;
              return (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Badge variant={severityCfg.variant}>{severityCfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
                  </TableCell>
                  <TableCell className="text-sm font-medium max-w-[200px] truncate">
                    {alert.title}
                  </TableCell>
                  <TableCell>
                    {alert.userId ? (
                      <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => onUserClick?.(alert.userId!)}
                      >
                        {alert.userName || alert.userId.slice(0, 8) + '...'}
                      </button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(alert.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {alert.status === 'open' && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setActionDialog({ type: 'dismiss', alertId: alert.id })}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setActionDialog({ type: 'escalate', alertId: alert.id })}
                        >
                          <ArrowUp className="mr-1 h-3 w-3" />
                          Escalate
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!actionDialog}
        onOpenChange={() => {
          setActionDialog(null);
          setNote('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'dismiss' ? 'Dismiss Alert' : 'Escalate Alert'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'dismiss'
                ? 'Đánh dấu alert này đã xử lý xong.'
                : 'Chuyển alert này lên cấp cao hơn để xử lý.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Ghi chú</label>
            <Input
              className="mt-1"
              placeholder="Nhập ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog(null);
                setNote('');
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAction}
              disabled={dismissAlert.isPending || escalateAlert.isPending || note.length < 3}
            >
              {dismissAlert.isPending || escalateAlert.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
