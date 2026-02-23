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
      toast.error('Ly do phai co it nhat 5 ky tu');
      return;
    }

    try {
      if (frozen) {
        await unfreezeSystem.mutateAsync(reason);
        toast.success('He thong da hoat dong tro lai');
      } else {
        await freezeSystem.mutateAsync(reason);
        toast.warning('He thong da tam dung');
      }
      setOpen(false);
      setReason('');
    } catch {
      toast.error('Thao tac that bai');
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
                    <span className="font-semibold text-red-600">TAM DUNG</span>
                    {systemData?.frozenReason && (
                      <span className="ml-2">- {systemData.frozenReason}</span>
                    )}
                  </>
                ) : (
                  <span className="text-green-600">Hoat dong binh thuong</span>
                )}
              </p>
            </div>
          </div>
          <Button variant={frozen ? 'default' : 'destructive'} onClick={() => setOpen(true)}>
            <Power className="mr-2 h-4 w-4" />
            {frozen ? 'BAT HE THONG' : 'TAT HE THONG'}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {frozen ? 'Bat lai he thong doi diem?' : 'Tat he thong doi diem?'}
            </DialogTitle>
            <DialogDescription>
              {frozen
                ? 'He thong se hoat dong tro lai, nguoi dung co the doi diem.'
                : 'TAT se chan MOI giao dich doi diem. Nguoi dung se khong the doi diem cho den khi bat lai.'}
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Huy
            </Button>
            <Button
              variant={frozen ? 'default' : 'destructive'}
              onClick={handleToggle}
              disabled={isPending || reason.length < 5}
            >
              {isPending ? 'Dang xu ly...' : frozen ? 'Bat he thong' : 'Tat he thong'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
