import { Eye } from 'lucide-react';
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
import type { EmailChangeRequest, EmailChangeStatus } from '@/lib/api';

interface Props {
  requests: EmailChangeRequest[];
  isLoading: boolean;
  onViewDetail: (request: EmailChangeRequest) => void;
}

const STATUS_CONFIG: Record<
  EmailChangeStatus,
  { label: string; variant: 'warning' | 'success' | 'destructive' | 'secondary' }
> = {
  pending: { label: 'Đang chờ', variant: 'warning' },
  completed: { label: 'Đã duyệt', variant: 'success' },
  disputed: { label: 'Tranh chấp', variant: 'destructive' },
  cancelled: { label: 'Đã hủy', variant: 'secondary' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateEmail(email: string, max = 22) {
  return email.length > max ? email.slice(0, max) + '...' : email;
}

export function EmailChangesTable({ requests, isLoading, onViewDetail }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email cũ</TableHead>
              <TableHead>Email mới</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
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

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Không có yêu cầu đổi email nào
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email cũ</TableHead>
            <TableHead>Email mới</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => {
            const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            return (
              <TableRow
                key={req.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onViewDetail(req)}
              >
                <TableCell className="font-mono text-xs text-gray-500">{req.id}</TableCell>
                <TableCell className="font-medium">{req.userName || '-'}</TableCell>
                <TableCell className="text-xs" title={req.oldEmail}>
                  {truncateEmail(req.oldEmail)}
                </TableCell>
                <TableCell className="text-xs" title={req.newEmail}>
                  {truncateEmail(req.newEmail)}
                </TableCell>
                <TableCell className="font-mono text-sm">{req.phone}</TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDate(req.requestedAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(req);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
