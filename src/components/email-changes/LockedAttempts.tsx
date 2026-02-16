import { useState } from 'react';
import { Unlock, ChevronDown, ChevronRight } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLockedAttempts, useUnlockPhone } from '@/hooks/useEmailChanges';
import { toast } from 'sonner';
import type { LockedAttemptData } from '@/lib/api';

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

function calcLockedUntil(lastAttempt: string) {
  const d = new Date(lastAttempt);
  d.setHours(d.getHours() + 24);
  return d;
}

export function LockedAttempts() {
  const { data: response, isLoading } = useLockedAttempts();
  const unlockMutation = useUnlockPhone();
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<LockedAttemptData | null>(null);

  const locked = response?.data || [];

  const handleUnlock = async () => {
    if (!unlockTarget) return;
    try {
      await unlockMutation.mutateAsync(unlockTarget.phone);
      toast.success(`Đã mở khóa SĐT ${unlockTarget.phone}`);
      setUnlockTarget(null);
    } catch {
      toast.error('Không thể mở khóa');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>SĐT</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Số lần thử</TableHead>
              <TableHead>Lần đầu</TableHead>
              <TableHead>Lần cuối</TableHead>
              <TableHead>Mở khóa lúc</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
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

  if (locked.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Không có SĐT nào đang bị khóa
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>SĐT</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Số lần thử</TableHead>
              <TableHead>Lần đầu</TableHead>
              <TableHead>Lần cuối</TableHead>
              <TableHead>Mở khóa lúc</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {locked.map((item) => {
              const isExpanded = expandedPhone === item.phone;
              const lockedUntil = calcLockedUntil(item.lastAttempt);
              return (
                <>
                  <TableRow
                    key={item.phone}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedPhone(isExpanded ? null : item.phone)}
                  >
                    <TableCell>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium">{item.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{item.ipAddress || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{item.attemptCount} lần</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDateTime(item.firstAttempt)}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(item.lastAttempt)}</TableCell>
                    <TableCell className="text-xs">
                      {formatDateTime(lockedUntil.toISOString())}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnlockTarget(item);
                        }}
                      >
                        <Unlock className="mr-1 h-3 w-3" />
                        Mở khóa
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${item.phone}-detail`}>
                      <TableCell colSpan={8} className="bg-gray-50 p-4">
                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          Chi tiết {item.attemptCount} lần thử sai
                        </p>
                        <div className="rounded border bg-white">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">Lần</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>IP</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {item.attempts.map((att, i) => (
                                <TableRow key={i}>
                                  <TableCell className="text-xs text-gray-500">{i + 1}</TableCell>
                                  <TableCell className="text-xs font-mono">
                                    {formatDateTime(att.attemptedAt)}
                                  </TableCell>
                                  <TableCell className="text-xs font-mono">
                                    {att.ipAddress || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Unlock Dialog */}
      <Dialog open={!!unlockTarget} onOpenChange={(v) => !v && setUnlockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận mở khóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Bạn có chắc muốn mở khóa SĐT{' '}
            <strong className="font-mono">{unlockTarget?.phone}</strong>?
            <br />
            Điều này sẽ xóa toàn bộ lịch sử thử sai trong 24h và cho phép SĐT này tiếp tục xác minh.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockTarget(null)}>
              Hủy
            </Button>
            <Button onClick={handleUnlock} disabled={unlockMutation.isPending}>
              {unlockMutation.isPending ? 'Đang mở khóa...' : 'Xác nhận mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
