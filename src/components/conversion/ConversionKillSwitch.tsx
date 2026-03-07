import { useState } from 'react';
import { Power, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useFreezeSystem, useUnfreezeSystem } from '@/hooks/useConversion';
import type { ConversionStatsData } from '@/types/conversion';

interface Props {
  systemData: ConversionStatsData['system'] | undefined;
}

export function ConversionKillSwitch({ systemData }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const frozen = systemData?.frozen ?? false;

  const freezeSystem = useFreezeSystem();
  const unfreezeSystem = useUnfreezeSystem();

  const handleToggle = async () => {
    if (reason.length < 5) {
      toast.error('Lý do phải có ít nhất 5 ký tự');
      return;
    }

    try {
      if (frozen) {
        await unfreezeSystem.mutateAsync(reason);
        toast.success('Hệ thống đã hoạt động trở lại');
      } else {
        await freezeSystem.mutateAsync(reason);
        toast.warning('Hệ thống đã tạm dừng');
      }
      setOpen(false);
      setReason('');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const isPending = freezeSystem.isPending || unfreezeSystem.isPending;

  return (
    <>
      <div
        className={`rounded-lg border p-4 ${frozen ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className={`h-5 w-5 ${frozen ? 'text-red-600' : 'text-green-600'}`} />
            <div>
              <p className="font-medium">Kill Switch</p>
              <p className="text-sm text-gray-600">
                {frozen ? (
                  <>
                    <span className="font-semibold text-red-600">TẠM DỪNG</span>
                    {systemData?.frozenReason && (
                      <span className="ml-2">- {systemData.frozenReason}</span>
                    )}
                  </>
                ) : (
                  <span className="text-green-600">Hoạt động bình thường</span>
                )}
              </p>
            </div>
          </div>
          <Button variant={frozen ? 'default' : 'destructive'} onClick={() => setOpen(true)}>
            <Power className="mr-2 h-4 w-4" />
            {frozen ? 'BẬT HỆ THỐNG' : 'TẮT HỆ THỐNG'}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {frozen ? 'Bật lại hệ thống đổi điểm?' : 'Tắt hệ thống đổi điểm?'}
            </DialogTitle>
            <DialogDescription>
              {frozen
                ? 'Hệ thống sẽ hoạt động trở lại, người dùng có thể đổi điểm.'
                : 'TẮT sẽ chặn MỌI giao dịch đổi điểm. Người dùng sẽ không thể đổi điểm cho đến khi bật lại.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Lý do (tối thiểu 5 ký tự)</label>
            <Input
              className="mt-1"
              placeholder="Nhập lý do..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              variant={frozen ? 'default' : 'destructive'}
              onClick={handleToggle}
              disabled={isPending || reason.length < 5}
            >
              {isPending ? 'Đang xử lý...' : frozen ? 'Bật hệ thống' : 'Tắt hệ thống'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
