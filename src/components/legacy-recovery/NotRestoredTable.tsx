

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNotRestoredMembers, useSearchMembers } from '@/hooks/useLegacyRecovery';
import { LegacyMemberData } from '@/lib/api';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  AlertCircle
} from 'lucide-react';

export function NotRestoredTable() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  // Use search if query exists, otherwise show paginated list
  const { data: listData, isLoading: isLoadingList, error: listError } = useNotRestoredMembers(
    page,
    limit
  );
  const { data: searchData, isLoading: isLoadingSearch } = useSearchMembers(
    searchQuery
  );

  const isLoading = searchQuery ? isLoadingSearch : isLoadingList;
  const data = searchQuery ? searchData : listData;
  const members = data?.members || [];
  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages || 1;

  if (listError) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Không thể tải danh sách thành viên</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thành viên chưa khôi phục
            {pagination && (
              <Badge variant="outline">
                {pagination.total.toLocaleString()} thành viên
              </Badge>
            )}
          </CardTitle>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm email, SĐT, tên..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset page when searching
              }}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'Không tìm thấy thành viên' : 'Không có thành viên cần khôi phục'}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Họ tên</th>
                    <th className="p-3 text-left font-medium">Liên hệ</th>
                    <th className="p-3 text-left font-medium">Cấp bậc</th>
                    <th className="p-3 text-left font-medium">Ngày tham gia</th>
                    <th className="p-3 text-left font-medium">Cổ phần</th>
                    <th className="p-3 text-left font-medium">F1</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <MemberRow key={member.id} member={member} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!searchQuery && pagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {((page - 1) * limit) + 1} đến{' '}
                  {Math.min(page * limit, pagination.total)} của{' '}
                  {pagination.total.toLocaleString()} thành viên
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                  </Button>
                  <div className="text-sm font-medium px-2">
                    Trang {page} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MemberRow({ member }: { member: LegacyMemberData }) {
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="p-3">
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-xs text-muted-foreground">ID: {member.id}</div>
        </div>
      </td>
      <td className="p-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[180px]">{member.email}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {member.phone}
          </div>
        </div>
      </td>
      <td className="p-3">
        <Badge variant="outline" className="gap-1">
          <Award className="h-3 w-3" />
          {member.rank}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {new Date(member.joined).toLocaleDateString('vi-VN')}
        </div>
      </td>
      <td className="p-3">
        <div className="font-medium">{member.shares.toLocaleString()}</div>
      </td>
      <td className="p-3">
        <Badge variant="secondary">
          {member.f1_total}
        </Badge>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}
