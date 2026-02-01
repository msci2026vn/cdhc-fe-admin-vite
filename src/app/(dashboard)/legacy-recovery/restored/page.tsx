

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRestoredMembers, useRecoveryStats } from '@/hooks/useLegacyRecovery';
import {
  ArrowLeft,
  UserCheck,
  Search,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function RestoredMembersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const { data: stats } = useRecoveryStats();
  const { data, isLoading, error, refetch, isRefetching } = useRestoredMembers(page, limit);

  // Filter by search query (client-side for now)
  const filteredMembers = data?.members?.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.phone?.includes(query)
    );
  }) || [];

  const handleExportCSV = () => {
    if (!data?.members) return;

    const headers = ['STT', 'Họ tên', 'Email', 'Số điện thoại', 'CMND', 'Ngày sinh', 'Ngày tham gia', 'Cấp bậc', 'Shares', 'OGN', 'TOR', 'Tổng F1'];
    const rows = data.members.map((m, idx) => [
      idx + 1,
      m.name,
      m.email,
      m.phone,
      m.pid,
      m.dob,
      m.joined,
      m.rank,
      m.shares,
      m.ogn,
      m.tor,
      m.f1_total,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thanh-vien-da-khoi-phuc-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = data?.pagination ? Math.ceil(data.pagination.total / limit) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/legacy-recovery">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              Thành viên đã khôi phục
            </h1>
            <p className="text-muted-foreground">
              {stats?.restored || 0} thành viên đã khôi phục thành công ({stats?.recoveryRate?.toFixed(2) || 0}%)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats?.restored || 0}</div>
            <p className="text-sm text-green-700 dark:text-green-300">Đã khôi phục</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Tổng Legacy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats?.notRestored || 0}</div>
            <p className="text-sm text-muted-foreground">Chưa khôi phục</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.recoveryRate ? (stats.recoveryRate < 1 ? stats.recoveryRate.toFixed(2) : stats.recoveryRate.toFixed(1)) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Tỷ lệ khôi phục</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Danh sách thành viên đã khôi phục</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm email, tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-destructive py-8">
              <AlertCircle className="h-5 w-5" />
              <span>Không thể tải danh sách. Vui lòng thử lại.</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'Không tìm thấy thành viên phù hợp' : 'Chưa có thành viên nào được khôi phục'}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium w-12">STT</th>
                      <th className="p-3 text-left font-medium">Thành viên</th>
                      <th className="p-3 text-left font-medium">Liên hệ</th>
                      <th className="p-3 text-left font-medium">Cấp bậc</th>
                      <th className="p-3 text-right font-medium">Shares</th>
                      <th className="p-3 text-right font-medium">OGN</th>
                      <th className="p-3 text-right font-medium">TOR</th>
                      <th className="p-3 text-right font-medium">F1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr key={member.email || index} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-muted-foreground">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{member.name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              Tham gia: {member.joined || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{member.email}</div>
                          {member.phone && (
                            <div className="text-xs text-muted-foreground">{member.phone}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={member.rank === 'VIP' || member.rank === 'CO-FOUNDER' ? 'default' : 'outline'}>
                            {member.rank || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono text-sm">
                          {(member.shares || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-sm text-green-600">
                          {(member.ogn || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-sm text-purple-600">
                          {(member.tor || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-sm">
                          {member.f1_total || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {page} / {totalPages} ({data?.pagination?.total || 0} thành viên)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
