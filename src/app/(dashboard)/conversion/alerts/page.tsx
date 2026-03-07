import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConversionAlertsTable, UserAuditDialog } from '@/components/conversion';
import { Pagination } from '@/components/users/Pagination';
import { useConversionAlerts, useRunAlertScan } from '@/hooks/useConversion';
import { toast } from 'sonner';

export default function ConversionAlertsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [status, setStatus] = useState('open');
  const [severity, setSeverity] = useState('all');
  const [alertType, setAlertType] = useState('all');
  const [auditUserId, setAuditUserId] = useState<string | null>(null);

  const { data: alertsResponse, isLoading } = useConversionAlerts({
    page,
    limit,
    status: status !== 'all' ? status : undefined,
    severity: severity !== 'all' ? severity : undefined,
    alertType: alertType !== 'all' ? alertType : undefined,
  });

  const runScan = useRunAlertScan();

  const alerts = alertsResponse?.data?.alerts || [];
  const pagination = alertsResponse?.data?.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  };

  const handleScan = async () => {
    try {
      const result = await runScan.mutateAsync();
      const created = (result as { data?: { alertsCreated?: number } })?.data?.alertsCreated ?? 0;
      toast.success(`Scan hoan tat. Tao ${created} alerts moi.`);
    } catch {
      toast.error('Scan that bai');
    }
  };

  const handleStatusChange = useCallback((v: string) => {
    setStatus(v);
    setPage(1);
  }, []);
  const handleSeverityChange = useCallback((v: string) => {
    setSeverity(v);
    setPage(1);
  }, []);
  const handleAlertTypeChange = useCallback((v: string) => {
    setAlertType(v);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Canh Bao Conversion</h1>
          <p className="text-gray-500">Quan ly canh bao tu dong va thu cong</p>
        </div>
        <Button onClick={handleScan} disabled={runScan.isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${runScan.isPending ? 'animate-spin' : ''}`} />
          {runScan.isPending ? 'Dang scan...' : 'Scan Ngay'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="open">Mo</SelectItem>
            <SelectItem value="dismissed">Da dismiss</SelectItem>
            <SelectItem value="escalated">Da escalate</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={handleSeverityChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Muc do" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={alertType} onValueChange={handleAlertTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="velocity_alert">Toc do cao</SelectItem>
            <SelectItem value="whale_alert">Ca voi</SelectItem>
            <SelectItem value="spike_alert">Dot bien</SelectItem>
            <SelectItem value="new_user_burst">User moi</SelectItem>
            <SelectItem value="round_trip_alert">Vong tron</SelectItem>
            <SelectItem value="balance_mismatch">Lech balance</SelectItem>
            <SelectItem value="multi_ip_alert">Da IP</SelectItem>
            <SelectItem value="failed_burst_alert">Spam that bai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConversionAlertsTable alerts={alerts} isLoading={isLoading} onUserClick={setAuditUserId} />

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

      <UserAuditDialog
        userId={auditUserId}
        open={!!auditUserId}
        onClose={() => setAuditUserId(null)}
      />
    </div>
  );
}
