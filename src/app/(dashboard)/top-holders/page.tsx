

import { AssetStatsCards, TopHoldersTable, ConcentrationCard } from '@/components/top-holders';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { useAssetTotals, useTopHoldersList } from '@/hooks/useTopHolders';

export default function TopHoldersPage() {
  const { refetch, isRefetching } = useAssetTotals();
  const { data: holdersData } = useTopHoldersList(500, 'total');

  const handleExportCSV = () => {
    if (!holdersData?.holders) return;

    // Convert to CSV
    const headers = ['Hạng', 'ID', 'Họ tên', 'Email', 'Cấp bậc', 'Shares', 'OGN', 'TOR', 'Tổng tài sản', 'Ngày tạo'];
    const rows = holdersData.holders.map(h => [
      h.rank,
      h.id,
      h.name,
      h.email,
      h.legacyRank,
      h.shares,
      h.ogn,
      h.tor,
      h.totalAssets,
      h.createdAt,
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
    a.download = `top-holders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Top Holders</h1>
          <p className="text-muted-foreground">
            Theo dõi và phân tích phân phối tài sản của các holders
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Stats Cards */}
      <AssetStatsCards />

      {/* Concentration & Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopHoldersTable />
        </div>
        <div>
          <ConcentrationCard />
        </div>
      </div>
    </div>
  );
}
