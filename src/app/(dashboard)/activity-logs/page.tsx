

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/users/Pagination';
import { useActivityLogs, useMyActivityLogs } from '@/hooks/useActivityLogs';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/lib/utils';
import type { AdminAction } from '@/types';

const ACTION_LABELS: Record<AdminAction, string> = {
  user_view: 'Xem user',
  user_approve: 'Duyệt user',
  user_reject: 'Từ chối user',
  user_suspend: 'Đình chỉ user',
  user_activate: 'Kích hoạt user',
  user_delete: 'Xóa user',
  user_update: 'Cập nhật user',
  user_bulk_approve: 'Duyệt hàng loạt',
  user_bulk_reject: 'Từ chối hàng loạt',
  user_bulk_suspend: 'Đình chỉ hàng loạt',
  staff_view: 'Xem staff',
  staff_create: 'Tạo staff',
  staff_update: 'Cập nhật staff',
  staff_delete: 'Xóa staff',
  staff_change_role: 'Đổi role staff',
  note_create: 'Tạo ghi chú',
  note_update: 'Sửa ghi chú',
  note_delete: 'Xóa ghi chú',
  stats_view: 'Xem thống kê',
  stats_refresh: 'Làm mới thống kê',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
};

const ACTION_COLORS: Record<string, string> = {
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  suspend: 'bg-yellow-100 text-yellow-800',
  activate: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  view: 'bg-gray-100 text-gray-800',
  login: 'bg-purple-100 text-purple-800',
  logout: 'bg-gray-100 text-gray-800',
};

function getActionColor(action: string): string {
  for (const key of Object.keys(ACTION_COLORS)) {
    if (action.includes(key)) {
      return ACTION_COLORS[key];
    }
  }
  return 'bg-gray-100 text-gray-800';
}

export default function ActivityLogsPage() {
  const { isSuperAdmin } = usePermission();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [action, setAction] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filters = {
    page,
    limit,
    action: action !== 'all' ? action : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  // Use different hooks based on permission
  const allLogsQuery = useActivityLogs(isSuperAdmin() ? filters : {});
  const myLogsQuery = useMyActivityLogs(!isSuperAdmin() ? filters : {});

  const { data, isLoading } = isSuperAdmin() ? allLogsQuery : myLogsQuery;
  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lịch sử hoạt động</h1>
        <p className="text-gray-500">
          {isSuperAdmin()
            ? 'Xem tất cả hoạt động trong hệ thống'
            : 'Xem lịch sử hoạt động của bạn'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả hành động" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hành động</SelectItem>
            <SelectItem value="user_approve">Duyệt user</SelectItem>
            <SelectItem value="user_reject">Từ chối user</SelectItem>
            <SelectItem value="user_suspend">Đình chỉ user</SelectItem>
            <SelectItem value="user_activate">Kích hoạt user</SelectItem>
            <SelectItem value="user_delete">Xóa user</SelectItem>
            <SelectItem value="staff_create">Tạo staff</SelectItem>
            <SelectItem value="staff_update">Cập nhật staff</SelectItem>
            <SelectItem value="login">Đăng nhập</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            className="w-[150px]"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            className="w-[150px]"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              {isSuperAdmin() && <TableHead>Admin</TableHead>}
              <TableHead>Hành động</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  {isSuperAdmin() && <TableCell><Skeleton className="h-4 w-40" /></TableCell>}
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin() ? 5 : 4} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  {isSuperAdmin() && (
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{log.adminEmail}</p>
                        <p className="text-xs text-gray-500">{log.adminRole}</p>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {ACTION_LABELS[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.description}
                    {log.targetEmail && (
                      <span className="text-gray-500"> ({log.targetEmail})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.ipAddress || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 0 && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
