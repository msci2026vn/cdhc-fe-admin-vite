import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserAudit, useFreezeUser, useUnfreezeUser } from '@/hooks/useConversion';

interface Props {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

type TabType = 'conversions' | 'failed' | 'alerts';

const FAIL_REASON_LABELS: Record<
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

export function UserAuditDialog({ userId, open, onClose }: Props) {
  const [tab, setTab] = useState<TabType>('conversions');
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [freezeAction, setFreezeAction] = useState<'freeze' | 'unfreeze'>('freeze');
  const [reason, setReason] = useState('');

  const { data: auditResponse, isLoading } = useUserAudit(userId);
  const freezeUser = useFreezeUser();
  const unfreezeUser = useUnfreezeUser();

  const audit = auditResponse?.data;

  const handleFreeze = async () => {
    if (!userId || reason.length < 5) {
      toast.error('Ly do phai co it nhat 5 ky tu');
      return;
    }
    try {
      if (freezeAction === 'freeze') {
        await freezeUser.mutateAsync({ targetUserId: userId, reason });
        toast.success('Da khoa user');
      } else {
        await unfreezeUser.mutateAsync({ targetUserId: userId, reason });
        toast.success('Da mo khoa user');
      }
      setFreezeDialogOpen(false);
      setReason('');
    } catch {
      toast.error('Thao tac that bai');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Audit User: {audit?.user?.name || userId?.slice(0, 12) + '...'}
              {audit?.user?.frozen && <Badge variant="destructive">Bi khoa</Badge>}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : audit ? (
            <div className="space-y-4">
              {/* User Actions */}
              <div className="flex gap-2">
                {audit.user.frozen ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFreezeAction('unfreeze');
                      setFreezeDialogOpen(true);
                    }}
                  >
                    <Unlock className="mr-1 h-4 w-4" />
                    Mo khoa
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setFreezeAction('freeze');
                      setFreezeDialogOpen(true);
                    }}
                  >
                    <Lock className="mr-1 h-4 w-4" />
                    Khoa User
                  </Button>
                )}
              </div>

              {/* Frozen banner */}
              {audit.user.frozen && (
                <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  User bi khoa boi {audit.user.frozenBy || 'admin'} vao{' '}
                  {audit.user.frozenAt ? formatDate(audit.user.frozenAt) : '-'}
                  {audit.user.frozenReason && <> - Ly do: {audit.user.frozenReason}</>}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatBox label="Seed→OGN" value={`${audit.stats.seedToOgn} lan`} />
                <StatBox label="OGN→Seed" value={`${audit.stats.ognToSeed} lan`} />
                <StatBox label="Tong Seed gui" value={formatNumber(audit.stats.totalSeedSent)} />
                <StatBox label="Tong OGN gui" value={formatNumber(audit.stats.totalOgnSent)} />
                <StatBox label="Phi Seed" value={formatNumber(audit.stats.totalFeesSeed)} />
                <StatBox label="Phi OGN" value={formatNumber(audit.stats.totalFeesOgn)} />
                <StatBox label="IP unique" value={String(audit.stats.uniqueIps)} />
                <StatBox
                  label="Lan dau"
                  value={
                    audit.stats.firstConversion ? formatDate(audit.stats.firstConversion) : '-'
                  }
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b">
                {(['conversions', 'failed', 'alerts'] as const).map((t) => (
                  <button
                    key={t}
                    className={cn(
                      'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                      tab === t
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700',
                    )}
                    onClick={() => setTab(t)}
                  >
                    {t === 'conversions'
                      ? 'Giao dich'
                      : t === 'failed'
                        ? 'Failed Attempts'
                        : 'Alerts'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {tab === 'conversions' && (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Huong</TableHead>
                        <TableHead>Moc</TableHead>
                        <TableHead>Gui</TableHead>
                        <TableHead>Phi</TableHead>
                        <TableHead>Nhan</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audit.conversions.length === 0 ? (
                        <TableRow>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            Không có giao dịch
                          </td>
                        </TableRow>
                      ) : (
                        audit.conversions.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>
                              <Badge
                                variant={c.direction === 'ogn_to_seed' ? 'warning' : 'success'}
                              >
                                {c.direction === 'seed_to_ogn' ? 'S→O' : 'O→S'}
                              </Badge>
                            </TableCell>
                            <TableCell>{c.tierId}</TableCell>
                            <TableCell className="text-sm">{formatNumber(c.fromAmount)}</TableCell>
                            <TableCell className="text-sm text-red-500">
                              {formatNumber(c.feeAmount)}
                            </TableCell>
                            <TableCell className="text-sm">{formatNumber(c.toAmount)}</TableCell>
                            <TableCell className="font-mono text-xs">{c.ipAddress}</TableCell>
                            <TableCell className="text-xs text-gray-500">
                              {formatDate(c.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {tab === 'failed' && (
                <div className="rounded-lg border p-8 text-center text-gray-500">
                  Xem trang Failed Attempts de loc theo user nay
                </div>
              )}

              {tab === 'alerts' && (
                <div className="rounded-lg border p-8 text-center text-gray-500">
                  Xem trang Canh bao de loc theo user nay
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">Khong tim thay du lieu</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Freeze/Unfreeze Dialog */}
      <Dialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {freezeAction === 'freeze' ? 'Khoa user doi diem?' : 'Mo khoa user?'}
            </DialogTitle>
            <DialogDescription>
              {freezeAction === 'freeze'
                ? 'User se khong the doi diem cho den khi duoc mo khoa.'
                : 'User se co the doi diem tro lai.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Ly do (toi thieu 5 ky tu)</label>
            <Input
              className="mt-1"
              placeholder="Nhap ly do..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFreezeDialogOpen(false)}>
              Huy
            </Button>
            <Button
              variant={freezeAction === 'freeze' ? 'destructive' : 'default'}
              onClick={handleFreeze}
              disabled={freezeUser.isPending || unfreezeUser.isPending || reason.length < 5}
            >
              {freezeUser.isPending || unfreezeUser.isPending
                ? 'Dang xu ly...'
                : freezeAction === 'freeze'
                  ? 'Khoa'
                  : 'Mo khoa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
