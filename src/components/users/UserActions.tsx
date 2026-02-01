

import { useState } from 'react';
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
import {
  useApproveUser,
  useRejectUser,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import type { User } from '@/types/user';

type ActionType = 'approve' | 'reject' | 'suspend' | 'activate' | 'delete' | null;

interface UserActionsDialogProps {
  user: User | null;
  action: ActionType;
  onClose: () => void;
}

export function UserActionsDialog({ user, action, onClose }: UserActionsDialogProps) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const deleteUser = useDeleteUser();

  const isLoading =
    approveUser.isPending ||
    rejectUser.isPending ||
    suspendUser.isPending ||
    activateUser.isPending ||
    deleteUser.isPending;

  const handleSubmit = async () => {
    if (!user || !action) return;

    try {
      switch (action) {
        case 'approve':
          await approveUser.mutateAsync({ id: user.id, note });
          toast.success('Đã duyệt thành viên thành công');
          break;
        case 'reject':
          if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
          }
          await rejectUser.mutateAsync({ id: user.id, reason });
          toast.success('Đã từ chối thành viên');
          break;
        case 'suspend':
          if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do đình chỉ');
            return;
          }
          await suspendUser.mutateAsync({ id: user.id, reason });
          toast.success('Đã đình chỉ thành viên');
          break;
        case 'activate':
          await activateUser.mutateAsync({ id: user.id, note });
          toast.success('Đã kích hoạt lại thành viên');
          break;
        case 'delete':
          await deleteUser.mutateAsync(user.id);
          toast.success('Đã xóa thành viên');
          break;
      }
      onClose();
      setReason('');
      setNote('');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const getDialogContent = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Duyệt thành viên',
          description: `Bạn có chắc muốn duyệt thành viên "${user?.name || user?.email}"?`,
          showNote: true,
          showReason: false,
          confirmText: 'Duyệt',
          confirmVariant: 'default' as const,
        };
      case 'reject':
        return {
          title: 'Từ chối thành viên',
          description: `Bạn có chắc muốn từ chối thành viên "${user?.name || user?.email}"?`,
          showNote: false,
          showReason: true,
          confirmText: 'Từ chối',
          confirmVariant: 'destructive' as const,
        };
      case 'suspend':
        return {
          title: 'Đình chỉ thành viên',
          description: `Bạn có chắc muốn đình chỉ thành viên "${user?.name || user?.email}"?`,
          showNote: false,
          showReason: true,
          confirmText: 'Đình chỉ',
          confirmVariant: 'destructive' as const,
        };
      case 'activate':
        return {
          title: 'Kích hoạt lại thành viên',
          description: `Bạn có chắc muốn kích hoạt lại thành viên "${user?.name || user?.email}"?`,
          showNote: true,
          showReason: false,
          confirmText: 'Kích hoạt',
          confirmVariant: 'default' as const,
        };
      case 'delete':
        return {
          title: 'Xóa thành viên',
          description: `Bạn có chắc muốn xóa thành viên "${user?.name || user?.email}"? Hành động này không thể hoàn tác.`,
          showNote: false,
          showReason: false,
          confirmText: 'Xóa',
          confirmVariant: 'destructive' as const,
        };
      default:
        return null;
    }
  };

  const content = getDialogContent();
  if (!content) return null;

  return (
    <Dialog open={!!action && !!user} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {content.showReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do *</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {content.showNote && (
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            variant={content.confirmVariant}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
