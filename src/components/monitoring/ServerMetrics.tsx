

import { Cpu, HardDrive, MemoryStick, Clock } from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { useServerMetrics, formatBytes, formatUptime } from '@/hooks/useMonitoring';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to safely get numeric value
function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

export function ServerMetrics() {
  const { data: metrics, isLoading, isError } = useServerMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        Không thể tải thông tin server
      </div>
    );
  }

  // Safe access with defaults - handle both nested and flat structures
  const cpuUsage = safeNumber(metrics.cpu?.usage ?? metrics.cpu);
  const cpuCores = safeNumber(metrics.cpu?.cores, 1);
  const cpuLoadAvg = Array.isArray(metrics.cpu?.loadAverage)
    ? safeNumber(metrics.cpu.loadAverage[0])
    : 0;

  const memoryUsagePercent = safeNumber(metrics.memory?.usagePercent ?? metrics.memory);
  const memoryUsed = safeNumber(metrics.memory?.used);
  const memoryTotal = safeNumber(metrics.memory?.total);

  const diskUsagePercent = safeNumber(metrics.disk?.usagePercent ?? metrics.disk);
  const diskUsed = safeNumber(metrics.disk?.used);
  const diskTotal = safeNumber(metrics.disk?.total);

  const uptime = safeNumber(metrics.uptime);
  const timestamp = metrics.timestamp || new Date().toISOString();

  const cpuColor = cpuUsage >= 80 ? 'red' : cpuUsage >= 60 ? 'orange' : 'green';
  const memoryColor = memoryUsagePercent >= 85 ? 'red' : memoryUsagePercent >= 70 ? 'orange' : 'green';
  const diskColor = diskUsagePercent >= 80 ? 'red' : diskUsagePercent >= 60 ? 'orange' : 'green';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="CPU Usage"
        value={`${cpuUsage.toFixed(1)}%`}
        subtitle={`${cpuCores} cores | Load: ${cpuLoadAvg.toFixed(2)}`}
        icon={Cpu}
        color={cpuColor}
      />
      <MetricsCard
        title="Memory Usage"
        value={`${memoryUsagePercent.toFixed(1)}%`}
        subtitle={memoryTotal > 0 ? `${formatBytes(memoryUsed)} / ${formatBytes(memoryTotal)}` : 'N/A'}
        icon={MemoryStick}
        color={memoryColor}
      />
      <MetricsCard
        title="Disk Usage"
        value={`${diskUsagePercent.toFixed(1)}%`}
        subtitle={diskTotal > 0 ? `${formatBytes(diskUsed)} / ${formatBytes(diskTotal)}` : 'N/A'}
        icon={HardDrive}
        color={diskColor}
      />
      <MetricsCard
        title="Uptime"
        value={formatUptime(uptime)}
        subtitle={new Date(timestamp).toLocaleTimeString('vi-VN')}
        icon={Clock}
        color="blue"
      />
    </div>
  );
}
