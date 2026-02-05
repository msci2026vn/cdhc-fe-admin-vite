import { Link } from 'react-router-dom';
import { MoreHorizontal, Eye, CheckCircle, XCircle, Pause, Play, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getInitials } from '@/lib/utils';
import {
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  ORG_TYPE_LABELS,
  ORG_TYPE_COLORS,
} from '@/types/user';
import type { User } from '@/types/user';
import { usePermission } from '@/hooks/usePermission';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  onSuspend: (user: User) => void;
  onActivate: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({
  users,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onDelete,
}: UserTableProps) {
  const { canAccess } = usePermission();
  const canModify = canAccess('users.approve');

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox disabled />
              </TableHead>
              <TableHead>Thành viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Loại TK</TableHead>
              <TableHead>Chờ nâng cấp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">Không có thành viên nào</p>
      </div>
    );
  }

  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate =
                      someSelected;
                  }
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Thành viên</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Loại TK</TableHead>
            <TableHead>Chờ nâng cấp</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày đăng ký</TableHead>
            <TableHead>Hoạt động</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={(checked) => onSelectOne(user.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={user.avatar || user.picture || undefined}
                      alt={user.name || user.email}
                    />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name || 'Chưa cập nhật'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary">{ROLE_LABELS[user.role] || user.role}</Badge>
                  {user.pendingRole && (
                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                      → {ROLE_LABELS[user.pendingRole] || user.pendingRole}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.orgType ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      ORG_TYPE_COLORS[user.orgType] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.orgType === 'organization' ? '🏢' : '👤'} {ORG_TYPE_LABELS[user.orgType]}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                {user.pendingRole ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏳ {ROLE_LABELS[user.pendingRole] || user.pendingRole}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[user.status]}>{STATUS_LABELS[user.status]}</Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">{formatDate(user.createdAt)}</TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(user.lastActiveAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/users/detail?id=${user.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Link>
                    </DropdownMenuItem>

                    {canModify && (
                      <>
                        <DropdownMenuSeparator />

                        {/* Duyệt user mới */}
                        {user.status === 'pending' && !user.pendingRole && (
                          <>
                            <DropdownMenuItem onClick={() => onApprove(user)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReject(user)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Từ chối
                            </DropdownMenuItem>
                          </>
                        )}

                        {/* Duyệt nâng cấp role */}
                        {user.pendingRole && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onApprove(user)}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Duyệt nâng cấp → {ROLE_LABELS[user.pendingRole] || user.pendingRole}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onReject(user)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Từ chối nâng cấp
                            </DropdownMenuItem>
                          </>
                        )}

                        {user.status === 'approved' && !user.pendingRole && (
                          <DropdownMenuItem onClick={() => onSuspend(user)}>
                            <Pause className="mr-2 h-4 w-4 text-yellow-600" />
                            Đình chỉ
                          </DropdownMenuItem>
                        )}

                        {user.status === 'suspended' && (
                          <DropdownMenuItem onClick={() => onActivate(user)}>
                            <Play className="mr-2 h-4 w-4 text-green-600" />
                            Kích hoạt lại
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
