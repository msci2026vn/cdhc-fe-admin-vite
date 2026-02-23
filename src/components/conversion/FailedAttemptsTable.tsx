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
  insufficient_seed: { label: 'Thieu Hat', variant: 'warning' },
  insufficient_ogn: { label: 'Thieu OGN', variant: 'warning' },
  level_too_low: { label: 'Chua du level', variant: 'secondary' },
  daily_limit_reached: { label: 'Het luot ngay', variant: 'info' },
  weekly_limit_reached: { label: 'Het luot tuan', variant: 'info' },
  cooldown_active: { label: 'Dang cooldown', variant: 'warning' },
  system_frozen: { label: 'He thong dung', variant: 'destructive' },
  user_frozen: { label: 'Bi khoa', variant: 'destructive' },
  invalid_tier: { label: 'Moc loi', variant: 'secondary' },
  duplicate_request: { label: 'Trung request', variant: 'secondary' },
  max_cap_exceeded: { label: 'Vuot gioi han', variant: 'destructive' },
  server_error: { label: 'Loi he thong', variant: 'destructive' },
};

export function FailedAttemptsTable({ attempts, isLoading, onUserClick, onIpClick }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Huong</TableHead>
              <TableHead>Moc</TableHead>
              <TableHead>Ly do</TableHead>
              <TableHead>Chi tiet</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Thoi gian</TableHead>
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
        Khong co failed attempts nao
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Huong</TableHead>
            <TableHead>Moc</TableHead>
            <TableHead>Ly do</TableHead>
            <TableHead>Chi tiet</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Thoi gian</TableHead>
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
