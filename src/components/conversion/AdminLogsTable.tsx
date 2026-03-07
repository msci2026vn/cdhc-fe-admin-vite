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
import type { AdminLogEntry } from '@/types/conversion';

interface Props {
  logs: AdminLogEntry[];
  isLoading: boolean;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; variant: 'destructive' | 'success' | 'secondary' | 'warning' | 'info' }
> = {
  freeze_user: { label: 'Khóa user', variant: 'destructive' },
  unfreeze_user: { label: 'Mở khóa user', variant: 'success' },
  freeze_system: { label: 'Tắt hệ thống', variant: 'destructive' },
  unfreeze_system: { label: 'Bật hệ thống', variant: 'success' },
  dismiss_alert: { label: 'Dismiss alert', variant: 'secondary' },
  escalate_alert: { label: 'Escalate alert', variant: 'warning' },
  manual_alert_scan: { label: 'Scan thủ công', variant: 'info' },
};

export function AdminLogsTable({ logs, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
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

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Chưa có lịch sử hành động nào
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Hành động</TableHead>
            <TableHead>Đối tượng</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Thời gian</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const actionCfg = ACTION_CONFIG[log.action] || {
              label: log.action,
              variant: 'secondary' as const,
            };
            return (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {log.adminName || log.adminEmail || log.adminUserId.slice(0, 8) + '...'}
                </TableCell>
                <TableCell>
                  <Badge variant={actionCfg.variant}>{actionCfg.label}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">
                  {log.targetUserId
                    ? log.targetUserId.slice(0, 8) + '...'
                    : log.targetAlertId
                      ? `Alert: ${log.targetAlertId.slice(0, 8)}...`
                      : '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm" title={log.reason || ''}>
                  {log.reason || '-'}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">{log.ipAddress}</TableCell>
                <TableCell className="text-xs text-gray-500">{formatDate(log.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
