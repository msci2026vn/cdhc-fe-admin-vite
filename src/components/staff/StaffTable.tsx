

import { MoreHorizontal, Eye, Pencil, Trash2, Shield } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/types/user';

interface Staff {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
  status: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  profile: {
    fullName: string | null;
    phone: string | null;
    department: string | null;
    position: string | null;
  } | null;
}

interface StaffTableProps {
  staff: Staff[];
  isLoading: boolean;
  onView: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onChangeRole: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export function StaffTable({
  staff,
  isLoading,
  onView,
  onEdit,
  onChangeRole,
  onDelete,
}: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đăng nhập cuối</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">Chưa có nhân viên nào</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Đăng nhập cuối</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name || 'Chưa cập nhật'}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={member.role === 'admin' ? 'default' : 'secondary'}
                >
                  {ROLE_LABELS[member.role] || member.role}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {member.profile?.department || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={member.isActive ? 'success' : 'secondary'}>
                  {member.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(member.lastLoginAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(member)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangeRole(member)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Đổi vai trò
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(member)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
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
