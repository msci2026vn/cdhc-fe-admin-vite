

import { useState } from 'react';
import { CheckCircle, XCircle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useBulkAction } from '@/hooks/useUsers';
import { usePermission } from '@/hooks/usePermission';

type BulkActionType = 'approve' | 'reject' | 'suspend' | 'activate';

interface BulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActions({ selectedIds, onClearSelection }: BulkActionsProps) {
  const { canAccess } = usePermission();
  const bulkAction = useBulkAction();
  const [action, setAction] = useState<BulkActionType | null>(null);
  const [reason, setReason] = useState('');

  if (selectedIds.length === 0 || !canAccess('users.approve')) {
    return null;
  }

  const handleAction = async () => {
    if (!action) return;

    if ((action === 'reject' || action === 'suspend') && !reason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    try {
      const result = await bulkAction.mutateAsync({
        action,
        userIds: selectedIds,
        reason: reason || undefined,
      });

      if (result.success && result.data) {
        toast.success(
          `Đã thực hiện thành công cho ${result.data.success}/${result.data.total} thành viên`
        );
        onClearSelection();
        setAction(null);
        setReason('');
      } else {
        toast.error('Có lỗi xảy ra');
      }
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const getDialogContent = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Duyệt hàng loạt',
          description: `Bạn có chắc muốn duyệt ${selectedIds.length} thành viên?`,
          showReason: false,
        };
      case 'reject':
        return {
          title: 'Từ chối hàng loạt',
          description: `Bạn có chắc muốn từ chối ${selectedIds.length} thành viên?`,
          showReason: true,
        };
      case 'suspend':
        return {
          title: 'Đình chỉ hàng loạt',
          description: `Bạn có chắc muốn đình chỉ ${selectedIds.length} thành viên?`,
          showReason: true,
        };
      case 'activate':
        return {
          title: 'Kích hoạt hàng loạt',
          description: `Bạn có chắc muốn kích hoạt lại ${selectedIds.length} thành viên?`,
          showReason: false,
        };
      default:
        return null;
    }
  };

  const content = getDialogContent();

  return (
    <>
      <div className="flex items-center gap-2 rounded-lg border bg-blue-50 p-3">
        <span className="text-sm font-medium text-blue-700">
          Đã chọn {selectedIds.length} thành viên
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAction('approve')}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Duyệt
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAction('reject')}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <XCircle className="mr-1 h-4 w-4" />
            Từ chối
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAction('suspend')}
            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
          >
            <Pause className="mr-1 h-4 w-4" />
            Đình chỉ
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAction('activate')}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Play className="mr-1 h-4 w-4" />
            Kích hoạt
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
          >
            Bỏ chọn
          </Button>
        </div>
      </div>

      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content?.title}</DialogTitle>
            <DialogDescription>{content?.description}</DialogDescription>
          </DialogHeader>

          {content?.showReason && (
            <div className="space-y-2 py-4">
              <Label htmlFor="bulk-reason">Lý do *</Label>
              <Textarea
                id="bulk-reason"
                placeholder="Nhập lý do..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={bulkAction.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAction}
              disabled={bulkAction.isPending}
            >
              {bulkAction.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
