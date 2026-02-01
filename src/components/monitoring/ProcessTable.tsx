

import { RefreshCw, Play, RotateCcw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  usePM2Processes,
  useRestartPM2,
  useReloadPM2,
  formatBytes,
  formatUptimeMs,
  getStatusColor,
} from '@/hooks/useMonitoring';
import { useIsSuperAdmin } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Helper to get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'online':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'stopped':
      return <XCircle className="h-4 w-4 text-gray-500" />;
    case 'errored':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
}

export function ProcessTable() {
  const { data: processes, isLoading, isError, refetch } = usePM2Processes();
  const restartPM2 = useRestartPM2();
  const reloadPM2 = useReloadPM2();
  const isSuperAdmin = useIsSuperAdmin();

  const handleRestart = async (processName: string) => {
    try {
      await restartPM2.mutateAsync(processName);
      toast.success(`Đã restart process ${processName}`);
    } catch (error) {
      toast.error(`Không thể restart process: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  const handleReload = async (processName: string) => {
    try {
      await reloadPM2.mutateAsync(processName);
      toast.success(`Đã reload process ${processName}`);
    } catch (error) {
      toast.error(`Không thể reload process: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  // Calculate summary stats
  const summary = processes ? {
    total: processes.length,
    online: processes.filter(p => p.status === 'online').length,
    stopped: processes.filter(p => p.status === 'stopped').length,
    errored: processes.filter(p => p.status === 'errored').length,
  } : { total: 0, online: 0, stopped: 0, errored: 0 };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PM2 Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PM2 Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Không thể tải thông tin processes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>PM2 Processes</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các tiến trình Node.js chạy trên server
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {processes && processes.length > 0 && (
          <div className="flex gap-4 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                <span className="font-semibold text-green-600">{summary.online}</span> đang chạy
              </span>
            </div>
            {summary.stopped > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-semibold text-gray-600">{summary.stopped}</span> đã dừng
                </span>
              </div>
            )}
            {summary.errored > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">
                  <span className="font-semibold text-red-600">{summary.errored}</span> lỗi
                </span>
              </div>
            )}
          </div>
        )}

        {processes && processes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Process</TableHead>
                <TableHead>PM ID</TableHead>
                <TableHead>PID</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Bộ nhớ</TableHead>
                <TableHead>Thời gian chạy</TableHead>
                <TableHead>Restart</TableHead>
                {isSuperAdmin && <TableHead>Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((proc) => {
                // Support both new (pm_id) and legacy (pmId) fields
                const pmId = proc.pm_id ?? proc.pmId ?? 0;
                const pid = proc.pid ?? 0;
                // Use human-readable values if available, otherwise format
                const memoryDisplay = proc.memoryHuman || formatBytes(proc.memory);
                const uptimeDisplay = proc.uptimeHuman || formatUptimeMs(proc.uptime);

                return (
                  <TableRow key={pmId}>
                    <TableCell className="font-medium">{proc.name}</TableCell>
                    <TableCell>{pmId}</TableCell>
                    <TableCell className="text-muted-foreground">{pid}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proc.status)}
                        <Badge className={getStatusColor(proc.status)}>
                          {proc.status === 'online' ? 'Đang chạy' :
                           proc.status === 'stopped' ? 'Đã dừng' :
                           proc.status === 'errored' ? 'Lỗi' : proc.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{proc.cpu.toFixed(1)}%</TableCell>
                    <TableCell>{memoryDisplay}</TableCell>
                    <TableCell>{uptimeDisplay}</TableCell>
                    <TableCell>{proc.restarts}</TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReload(proc.name)}
                            disabled={reloadPM2.isPending}
                            title="Reload (không downtime)"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestart(proc.name)}
                            disabled={restartPM2.isPending}
                            title="Restart"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Không có process nào đang chạy
          </div>
        )}
      </CardContent>
    </Card>
  );
}
