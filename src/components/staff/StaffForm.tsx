

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useCreateStaff, useUpdateStaff } from '@/hooks/useStaff';

const staffSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  name: z.string().min(1, 'Vui lòng nhập tên'),
  role: z.enum(['admin', 'editor']),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  sendInviteEmail: z.boolean(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface Staff {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
  profile: {
    fullName: string | null;
    phone: string | null;
    department: string | null;
    position: string | null;
  } | null;
}

interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  staff?: Staff | null;
}

export function StaffForm({ open, onClose, staff }: StaffFormProps) {
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const isEditing = !!staff;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: staff?.email || '',
      name: staff?.name || '',
      role: staff?.role || 'editor',
      fullName: staff?.profile?.fullName || '',
      phone: staff?.profile?.phone || '',
      department: staff?.profile?.department || '',
      position: staff?.profile?.position || '',
      sendInviteEmail: true,
    },
  });

  const onSubmit = async (data: StaffFormData) => {
    try {
      if (isEditing && staff) {
        await updateStaff.mutateAsync({
          id: staff.id,
          data: {
            name: data.name,
            profile: {
              fullName: data.fullName,
              phone: data.phone,
              department: data.department,
              position: data.position,
            },
          },
        });
        toast.success('Đã cập nhật nhân viên');
      } else {
        await createStaff.mutateAsync({
          email: data.email,
          name: data.name,
          role: data.role,
          profile: {
            fullName: data.fullName,
            phone: data.phone,
            department: data.department,
            position: data.position,
          },
          sendInviteEmail: data.sendInviteEmail,
        });
        toast.success('Đã tạo nhân viên mới');
      }
      reset();
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const isLoading = createStaff.isPending || updateStaff.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={isEditing}
              placeholder="email@cdhc.vn"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên hiển thị *</Label>
            <Input id="name" {...register('name')} placeholder="Nguyễn Văn A" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò *</Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value as 'admin' | 'editor')}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" {...register('fullName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Input id="department" {...register('department')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Input id="position" {...register('position')} />
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="sendInviteEmail"
                checked={watch('sendInviteEmail')}
                onCheckedChange={(checked) =>
                  setValue('sendInviteEmail', !!checked)
                }
              />
              <Label htmlFor="sendInviteEmail" className="text-sm font-normal">
                Gửi email mời tham gia
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
