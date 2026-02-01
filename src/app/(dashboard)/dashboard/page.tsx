

import { RefreshCw, Server, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from '@/components/stats/StatsCards';
import { RoleChart } from '@/components/stats/RoleChart';
import { RegistrationChart } from '@/components/stats/RegistrationChart';
import { OnlineStats } from '@/components/stats/OnlineStats';
import {
  ServerMetrics,
  ProcessTable,
  DatabaseStatsCard,
  CacheStatsCard,
  AlertsList,
} from '@/components/monitoring';
import { useRefreshStats } from '@/hooks/useStats';
import { usePermission } from '@/hooks/usePermission';
import { toast } from 'sonner';

export default function DashboardPage() {
  const refreshStats = useRefreshStats();
  const { isSuperAdmin } = usePermission();

  const handleRefresh = async () => {
    try {
      await refreshStats.mutateAsync();
      toast.success('Da lam moi thong ke');
    } catch {
      toast.error('Khong the lam moi thong ke');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Tong quan he thong Con Duong Huu Co</p>
        </div>
        {isSuperAdmin() && (
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshStats.isPending}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshStats.isPending ? 'animate-spin' : ''}`}
            />
            Lam moi
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tong quan
          </TabsTrigger>
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Server Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Tab Tong quan - Thong ke nguoi dung */}
        <TabsContent value="overview" className="space-y-6">
          <StatsCards />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RoleChart />
            <RegistrationChart />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <OnlineStats />
          </div>
        </TabsContent>

        {/* Tab Server Monitoring - Theo doi server */}
        <TabsContent value="server" className="space-y-6">
          {/* Server Metrics */}
          <ServerMetrics />

          {/* PM2 Processes */}
          <ProcessTable />

          {/* Database & Cache */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DatabaseStatsCard />
            <CacheStatsCard />
          </div>

          {/* Alerts */}
          <AlertsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
