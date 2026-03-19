import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserEmailInfo, useResetEmailLimit, useAdminChangeEmail } from '@/hooks/useUsers';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/lib/utils';

interface EmailManagementSectionProps {
  userId: string;
}

export function EmailManagementSection({ userId }: EmailManagementSectionProps) {
  const { data: response, isLoading, refetch } = useUserEmailInfo(userId);
  const resetLimit = useResetEmailLimit();
  const changeEmail = useAdminChangeEmail();
  const { isAdmin, isSuperAdmin } = usePermission();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const canEdit = isAdmin() || isSuperAdmin();
  const data = response?.data;

  const renderCooldownBadge = () => {
    if (!data) return null;
    if (data.daysUntilNextChange === null) {
      return <Badge variant="secondary">Chưa đổi lần nào</Badge>;
    }
    if (data.daysUntilNextChange > 0) {
      return <Badge variant="warning">Còn {data.daysUntilNextChange} ngày</Badge>;
    }
    return <Badge variant="success">Được phép đổi</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : !data ? (
            <p className="text-sm text-gray-500">Không thể tải thông tin email</p>
          ) : (
            <>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Email hiện tại</dt>
                  <dd className="font-medium">{data.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Lần đổi cuối</dt>
                  <dd className="font-medium">
                    {data.emailChangedAt ? formatDate(data.emailChangedAt) : 'Chưa bao giờ đổi'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Trạng thái cooldown</dt>
                  <dd className="mt-1">{renderCooldownBadge()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">OTP đang chờ</dt>
                  <dd className="mt-1">
                    {data.hasPendingOtp ? (
                      <Badge variant="warning">Có — {data.pendingNewEmail}</Badge>
                    ) : (
                      <Badge variant="secondary">Không</Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Số lần sai OTP</dt>
                  <dd className="mt-1">
                    {data.failedAttempts > 0 ? (
                      <Badge variant="destructive">{data.failedAttempts} lần</Badge>
                    ) : (
                      '0'
                    )}
                  </dd>
                </div>
              </dl>

              {canEdit && (
                <div className="flex flex-wrap gap-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    disabled={data.daysUntilNextChange === null}
                    onClick={() => setConfirmResetOpen(true)}
                  >
                    Reset giới hạn 30 ngày
                  </Button>
                  <Button variant="outline" onClick={() => setChangeEmailOpen(true)}>
                    Đổi email hộ
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Reset Dialog */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset giới hạn đổi email</DialogTitle>
            <DialogDescription>
              User sẽ được phép đổi email ngay lập tức. Bạn có chắc chắn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
              Hủy
            </Button>
            <Button
              disabled={resetLimit.isPending}
              onClick={async () => {
                await resetLimit.mutateAsync(userId);
                refetch();
                setConfirmResetOpen(false);
              }}
            >
              {resetLimit.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi email hộ user</DialogTitle>
            <DialogDescription>
              Thay đổi này không cần OTP xác nhận. Session hiện tại của user sẽ bị vô hiệu hóa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="Email mới"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangeEmailOpen(false);
                setNewEmail('');
              }}
            >
              Hủy
            </Button>
            <Button
              disabled={!newEmail || !newEmail.includes('@') || changeEmail.isPending}
              onClick={async () => {
                await changeEmail.mutateAsync({ userId, newEmail });
                refetch();
                setNewEmail('');
                setChangeEmailOpen(false);
              }}
            >
              {changeEmail.isPending ? 'Đang xử lý...' : 'Đổi email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
