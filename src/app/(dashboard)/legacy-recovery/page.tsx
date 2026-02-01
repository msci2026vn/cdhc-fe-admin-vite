

import { RecoveryStatsCards, NotRestoredTable } from '@/components/legacy-recovery';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Mail, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useRecoveryStats, useNotRestoredMembers } from '@/hooks/useLegacyRecovery';

export default function LegacyRecoveryPage() {
  const { refetch, isRefetching } = useRecoveryStats();
  const { data: membersData } = useNotRestoredMembers(1, 10000);

  const handleExportCSV = () => {
    if (!membersData?.members) return;

    // Convert to CSV
    const headers = ['ID', 'Họ tên', 'Email', 'Số điện thoại', 'CMND', 'Ngày sinh', 'Ngày tham gia', 'Cấp bậc', 'Cổ phần', 'OGN', 'TOR', 'F1'];
    const rows = membersData.members.map(m => [
      m.id,
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
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Khôi phục thành viên cũ</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý việc khôi phục tài khoản thành viên cũ
          </p>
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
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Gửi Email khôi phục
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <RecoveryStatsCards />

      {/* Alert Banner (if recovery rate is 0) */}
      <RecoveryAlert />

      {/* Not Restored Members Table */}
      <NotRestoredTable />
    </div>
  );
}

function RecoveryAlert() {
  const { data: stats } = useRecoveryStats();

  if (!stats) return null;

  // No recovery yet - warning state
  if (stats.recoveryRate === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                Chưa có thành viên nào được khôi phục
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Bạn có {stats.total.toLocaleString()} thành viên cũ đang chờ khôi phục tài khoản.
                Hãy cân nhắc khởi động chiến dịch email để giúp họ lấy lại quyền truy cập.
              </p>
              <Button className="mt-3" size="sm" variant="default">
                <Mail className="h-4 w-4 mr-2" />
                Khởi động chiến dịch khôi phục
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Low recovery (< 10%) - info state with progress
  if (stats.recoveryRate < 10) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Đang trong quá trình khôi phục
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {stats.restored.toLocaleString()} thành viên đã khôi phục ({stats.recoveryRate < 1 ? stats.recoveryRate.toFixed(2) : stats.recoveryRate.toFixed(1)}%).
                Còn {stats.notRestored.toLocaleString()} thành viên đang chờ.
              </p>
              <Button className="mt-3" size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Tiếp tục chiến dịch khôi phục
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Good recovery (>= 10%) - success state
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Tiến độ tốt!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {stats.restored.toLocaleString()} thành viên đã khôi phục ({stats.recoveryRate.toFixed(1)}%).
              {stats.notRestored > 0 && ` Còn ${stats.notRestored.toLocaleString()} thành viên đang chờ.`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
