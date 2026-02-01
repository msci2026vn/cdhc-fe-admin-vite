

import { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePermission } from '@/hooks/usePermission';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const notificationSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['system', 'account', 'announcement', 'promotion', 'reminder', 'update']),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  content: z.string().min(1, 'Vui lòng nhập nội dung').max(5000),
  actionUrl: z.string().url().optional().or(z.literal('')),
  actionText: z.string().optional(),
  sendEmail: z.boolean(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;
type BroadcastFormData = NotificationFormData & {
  targetRoles?: string[];
};

const notificationTypes = [
  { value: 'system', label: 'Hệ thống' },
  { value: 'account', label: 'Tài khoản' },
  { value: 'announcement', label: 'Thông báo' },
  { value: 'promotion', label: 'Khuyến mãi' },
  { value: 'reminder', label: 'Nhắc nhở' },
  { value: 'update', label: 'Cập nhật' },
];

const targetRoles = [
  { value: 'farmer', label: 'Nhà nông' },
  { value: 'community', label: 'Cộng đồng' },
  { value: 'business', label: 'Doanh nghiệp' },
  { value: 'coop', label: 'Hợp tác xã' },
  { value: 'shop', label: 'Cửa hàng' },
  { value: 'expert', label: 'Chuyên gia' },
  { value: 'kol', label: 'KOL' },
  { value: 'koc', label: 'KOC' },
];

export default function NotificationsPage() {
  const { canAccess, canBroadcast } = usePermission();
  const [isSending, setIsSending] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'system',
      sendEmail: false,
    },
  });

  const onSendSingle = async (data: NotificationFormData) => {
    if (!data.userId) {
      toast.error('Vui lòng nhập User ID');
      return;
    }

    setIsSending(true);
    try {
      const result = await api.post('/api/admin/notifications', data);
      if (result.success) {
        toast.success('Đã gửi thông báo thành công');
        reset();
      } else {
        toast.error(result.error?.message || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSending(false);
    }
  };

  const onBroadcast = async (data: NotificationFormData) => {
    setIsSending(true);
    try {
      const broadcastData: BroadcastFormData = {
        ...data,
        targetRoles: selectedRoles.length > 0 ? selectedRoles : undefined,
      };
      delete (broadcastData as Record<string, unknown>).userId;

      const result = await api.post('/api/admin/notifications/broadcast', broadcastData);
      if (result.success) {
        toast.success('Đã gửi thông báo hàng loạt thành công');
        reset();
        setSelectedRoles([]);
      } else {
        toast.error(result.error?.message || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSending(false);
    }
  };

  if (!canAccess('notifications.send')) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Bạn không có quyền gửi thông báo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <p className="text-gray-500">Gửi thông báo đến thành viên</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send to single user */}
        <Card>
          <CardHeader>
            <CardTitle>Gửi đến 1 người</CardTitle>
            <CardDescription>Gửi thông báo đến một thành viên cụ thể</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSendSingle)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  {...register('userId')}
                  placeholder="UUID của user"
                />
              </div>

              <div className="space-y-2">
                <Label>Loại thông báo</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) => setValue('type', v as NotificationFormData['type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input id="title" {...register('title')} />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea id="content" {...register('content')} rows={4} />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionUrl">URL</Label>
                  <Input id="actionUrl" {...register('actionUrl')} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actionText">Nút bấm</Label>
                  <Input id="actionText" {...register('actionText')} placeholder="Xem ngay" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="sendEmail"
                  checked={watch('sendEmail')}
                  onCheckedChange={(c) => setValue('sendEmail', !!c)}
                />
                <Label htmlFor="sendEmail" className="text-sm font-normal">
                  Gửi email kèm theo
                </Label>
              </div>

              <Button type="submit" disabled={isSending} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Broadcast */}
        {canBroadcast() && (
          <Card>
            <CardHeader>
              <CardTitle>Gửi hàng loạt</CardTitle>
              <CardDescription>Gửi thông báo đến nhiều thành viên</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onBroadcast)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Đối tượng nhận</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {targetRoles.map((role) => (
                      <div key={role.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`role-${role.value}`}
                          checked={selectedRoles.includes(role.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRoles([...selectedRoles, role.value]);
                            } else {
                              setSelectedRoles(selectedRoles.filter((r) => r !== role.value));
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.value}`} className="text-sm font-normal">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Không chọn = gửi cho tất cả
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Loại thông báo</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(v) => setValue('type', v as NotificationFormData['type'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-title">Tiêu đề *</Label>
                  <Input id="broadcast-title" {...register('title')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-content">Nội dung *</Label>
                  <Textarea id="broadcast-content" {...register('content')} rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-actionUrl">URL</Label>
                    <Input id="broadcast-actionUrl" {...register('actionUrl')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-actionText">Nút bấm</Label>
                    <Input id="broadcast-actionText" {...register('actionText')} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="broadcast-sendEmail"
                    checked={watch('sendEmail')}
                    onCheckedChange={(c) => setValue('sendEmail', !!c)}
                  />
                  <Label htmlFor="broadcast-sendEmail" className="text-sm font-normal">
                    Gửi email kèm theo
                  </Label>
                </div>

                <Button type="submit" disabled={isSending} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? 'Đang gửi...' : 'Gửi thông báo hàng loạt'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
