

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAssetTotals } from '@/hooks/useTopHolders';
import {
  TrendingUp,
  Users,
  Coins,
  Wallet,
  AlertCircle
} from 'lucide-react';

export function AssetStatsCards() {
  const { data: totals, isLoading, error } = useAssetTotals();

  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  if (error || !totals) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Không thể tải thống kê tài sản</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatFull = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Shares */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng Shares
          </CardTitle>
          <Coins className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(totals.totalShares)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatFull(totals.totalShares)} shares
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {totals.sharesHolders} holders
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total OGN */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng OGN
          </CardTitle>
          <Wallet className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(totals.totalOgn)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatFull(totals.totalOgn)} OGN
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {totals.ognHolders} holders
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total TOR */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng TOR
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(totals.totalTor)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatFull(totals.totalTor)} TOR
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {totals.torHolders} holders
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Holders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng Holders
          </CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totals.totalHolders}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Holders duy nhất
          </p>
          {totals.avgShares && (
            <p className="text-xs text-muted-foreground mt-2">
              TB: {formatNumber(totals.avgShares)} shares
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
