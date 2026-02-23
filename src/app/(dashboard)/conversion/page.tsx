import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ConversionStatsCards,
  ConversionKillSwitch,
  ConversionRecentTable,
  ConversionLeaderboard,
} from '@/components/conversion';
import { UserAuditDialog } from '@/components/conversion';
import {
  useConversionStats,
  useConversionLeaderboard,
  useConversionList,
} from '@/hooks/useConversion';
import { useQueryClient } from '@tanstack/react-query';

export default function ConversionDashboardPage() {
  const queryClient = useQueryClient();
  const [auditUserId, setAuditUserId] = useState<string | null>(null);

  const { data: statsResponse, isLoading: statsLoading } = useConversionStats();
  const { data: leaderboardResponse, isLoading: leaderboardLoading } = useConversionLeaderboard(5);
  const { data: listResponse, isLoading: listLoading } = useConversionList({
    page: 1,
    limit: 5,
  });

  const stats = statsResponse?.data;
  const leaderboard = leaderboardResponse?.data?.leaderboard || [];
  const recentConversions = listResponse?.data?.conversions || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['conversion-stats'] });
    queryClient.invalidateQueries({ queryKey: ['conversion-leaderboard'] });
    queryClient.invalidateQueries({ queryKey: ['conversion-list'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doi Diem — Tong Quan</h1>
          <p className="text-gray-500">Quan ly he thong doi diem Seed/OGN</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Lam moi
        </Button>
      </div>

      {/* Stats Cards */}
      <ConversionStatsCards data={stats} isLoading={statsLoading} />

      {/* Kill Switch */}
      <ConversionKillSwitch systemData={stats?.system} />

      {/* Recent + Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ConversionRecentTable
            conversions={recentConversions}
            isLoading={listLoading}
            onUserClick={setAuditUserId}
          />
        </div>
        <div>
          <ConversionLeaderboard
            entries={leaderboard}
            isLoading={leaderboardLoading}
            onUserClick={setAuditUserId}
          />
        </div>
      </div>

      {/* User Audit Dialog */}
      <UserAuditDialog
        userId={auditUserId}
        open={!!auditUserId}
        onClose={() => setAuditUserId(null)}
      />
    </div>
  );
}
