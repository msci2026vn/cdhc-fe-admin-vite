import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Suspense } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/useUsers';
import { usePermission } from '@/hooks/usePermission';
import { formatDate, getInitials } from '@/lib/utils';
import { ROLE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/types/user';

function UserDetailContent() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { data, isLoading, error } = useUserProfile(id || '');
  const { isEditor } = usePermission();

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy ID thành viên</p>
        <Button asChild className="mt-4">
          <Link to="/users">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px]" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thành viên</p>
        <Button asChild className="mt-4">
          <Link to="/users">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const { user, profile } = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chi tiết thành viên</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{user.name || 'Chưa cập nhật'}</h2>
                    <Badge className={STATUS_COLORS[user.status]}>
                      {STATUS_LABELS[user.status]}
                    </Badge>
                    <Badge variant="secondary">{ROLE_LABELS[user.role] || user.role}</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {(!isEditor() || user.phone) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{isEditor() ? '***' : user.phone || 'Chưa cập nhật'}</span>
                      </div>
                    )}
                    {profile?.province && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {profile.district && `${profile.district}, `}
                          {profile.province}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Đăng ký: {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.fullName && (
                    <div>
                      <dt className="text-sm text-gray-500">Họ và tên</dt>
                      <dd className="font-medium">{profile.fullName}</dd>
                    </div>
                  )}
                  {profile.farmSize && (
                    <div>
                      <dt className="text-sm text-gray-500">Diện tích</dt>
                      <dd className="font-medium">{profile.farmSize}</dd>
                    </div>
                  )}
                  {profile.mainProducts && profile.mainProducts.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm text-gray-500">Sản phẩm chính</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {profile.mainProducts.map((product, i) => (
                          <Badge key={i} variant="outline">
                            {product}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <dt className="text-sm text-gray-500">Phòng ban</dt>
                      <dd className="font-medium">{profile.department}</dd>
                    </div>
                  )}
                  {profile.position && (
                    <div>
                      <dt className="text-sm text-gray-500">Chức vụ</dt>
                      <dd className="font-medium">{profile.position}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Đăng nhập cuối</span>
                </div>
                <span className="text-sm font-medium">{formatDate(user.lastLoginAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Hoạt động cuối</span>
                </div>
                <span className="text-sm font-medium">{formatDate(user.lastActiveAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái</span>
                <Badge variant={user.isActive ? 'success' : 'secondary'}>
                  {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {(user.approvedAt || user.rejectedAt || user.suspendedAt) && (
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.approvedAt && (
                  <div className="text-sm">
                    <span className="text-gray-500">Duyệt lúc: </span>
                    <span className="font-medium">{formatDate(user.approvedAt)}</span>
                  </div>
                )}
                {user.rejectedAt && (
                  <div className="text-sm">
                    <span className="text-gray-500">Từ chối lúc: </span>
                    <span className="font-medium">{formatDate(user.rejectedAt)}</span>
                    {user.rejectionReason && (
                      <p className="mt-1 text-red-600">Lý do: {user.rejectionReason}</p>
                    )}
                  </div>
                )}
                {user.suspendedAt && (
                  <div className="text-sm">
                    <span className="text-gray-500">Đình chỉ lúc: </span>
                    <span className="font-medium">{formatDate(user.suspendedAt)}</span>
                    {user.suspensionReason && (
                      <p className="mt-1 text-yellow-600">Lý do: {user.suspensionReason}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px]" />
            </div>
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      }
    >
      <UserDetailContent />
    </Suspense>
  );
}
