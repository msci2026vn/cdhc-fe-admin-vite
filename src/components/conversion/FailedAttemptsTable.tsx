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
import type { FailedAttempt } from '@/types/conversion';

interface Props {
  attempts: FailedAttempt[];
  isLoading: boolean;
  onUserClick?: (userId: string) => void;
  onIpClick?: (ip: string) => void;
}

const FAIL_REASON_CONFIG: Record<
  string,
  { label: string; variant: 'warning' | 'secondary' | 'info' | 'destructive' }
> = {
  insufficient_seed: { label: 'Thiếu Hạt', variant: 'warning' },
  insufficient_ogn: { label: 'Thiếu OGN', variant: 'warning' },
  level_too_low: { label: 'Chưa đủ level', variant: 'secondary' },
  daily_limit_reached: { label: 'Hết lượt ngày', variant: 'info' },
  weekly_limit_reached: { label: 'Hết lượt tuần', variant: 'info' },
  cooldown_active: { label: 'Đang cooldown', variant: 'warning' },
  system_frozen: { label: 'Hệ thống dừng', variant: 'destructive' },
  user_frozen: { label: 'Bị khóa', variant: 'destructive' },
  invalid_tier: { label: 'Mốc lỗi', variant: 'secondary' },
  duplicate_request: { label: 'Trùng request', variant: 'secondary' },
  max_cap_exceeded: { label: 'Vượt giới hạn', variant: 'destructive' },
  server_error: { label: 'Lỗi hệ thống', variant: 'destructive' },
};

export function FailedAttemptsTable({ attempts, isLoading, onUserClick, onIpClick }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Hướng</TableHead>
              <TableHead>Mốc</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Thời gian</TableHead>
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

  if (attempts.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Không có failed attempts nào
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Hướng</TableHead>
            <TableHead>Mốc</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Chi tiết</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Thời gian</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((a) => {
            const reasonCfg = FAIL_REASON_CONFIG[a.failReason] || {
              label: a.failReason,
              variant: 'secondary' as const,
            };
            return (
              <TableRow key={a.id}>
                <TableCell>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => onUserClick?.(a.userId)}
                  >
                    {a.userName || a.userId.slice(0, 8) + '...'}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={a.direction === 'ogn_to_seed' ? 'warning' : 'success'}>
                    {a.direction === 'seed_to_ogn' ? 'S→O' : 'O→S'}
                  </Badge>
                </TableCell>
                <TableCell>{a.tierId}</TableCell>
                <TableCell>
                  <Badge variant={reasonCfg.variant}>{reasonCfg.label}</Badge>
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate text-xs text-gray-500"
                  title={a.failDetail || ''}
                >
                  {a.failDetail || '-'}
                </TableCell>
                <TableCell>
                  <button
                    className="font-mono text-xs text-gray-500 hover:text-blue-600"
                    onClick={() => onIpClick?.(a.ipAddress)}
                  >
                    {a.ipAddress}
                  </button>
                </TableCell>
                <TableCell className="text-xs text-gray-500">{formatDate(a.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
