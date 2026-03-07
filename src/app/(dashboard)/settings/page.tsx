import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/types/user';

export default function SettingsPage() {
  const { admin } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-gray-500">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Thông tin cơ bản về tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={admin?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Ten hien thi</Label>
              <Input value={admin?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Vai tro</Label>
              <Input
                value={ROLE_LABELS[admin?.role as keyof typeof ROLE_LABELS] || admin?.role || ''}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bảo mật</CardTitle>
            <CardDescription>Quản lý bảo mật tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Tài khoản của bạn được liên kết với Google. Để thay đổi mật khẩu hoặc cài đặt bảo mật,
              vui lòng truy cập cài đặt tài khoản Google của bạn.
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quản lý tài khoản Google
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
