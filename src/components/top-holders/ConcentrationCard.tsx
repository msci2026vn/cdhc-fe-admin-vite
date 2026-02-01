

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useConcentration } from '@/hooks/useTopHolders';
import { TrendingUp, AlertCircle } from 'lucide-react';

export function ConcentrationCard() {
  const { data: concentration, isLoading, error } = useConcentration();

  // Debug log
  console.log('[ConcentrationCard] Data:', concentration);

  if (isLoading) {
    return <ConcentrationSkeleton />;
  }

  if (error || !concentration) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Không thể tải dữ liệu tập trung</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safe number formatting
  const formatPercent = (num: number | undefined | null) => {
    return (num ?? 0).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Chỉ số tập trung tài sản
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tỷ lệ tài sản được nắm giữ bởi top holders
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 10 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Top 10 Holders</span>
            <span className="text-2xl font-bold text-primary">
              {formatPercent(concentration.top10Percentage)}%
            </span>
          </div>
          <Progress value={concentration.top10Percentage ?? 0} className="h-3" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatPercent(concentration.top10Shares)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
              <span className="text-muted-foreground">OGN</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatPercent(concentration.top10Ogn)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
              <span className="text-muted-foreground">TOR</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {formatPercent(concentration.top10Tor)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top 50 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Top 50 Holders</span>
            <span className="text-2xl font-bold text-primary">
              {formatPercent(concentration.top50Percentage)}%
            </span>
          </div>
          <Progress value={concentration.top50Percentage ?? 0} className="h-3" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatPercent(concentration.top50Shares)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
              <span className="text-muted-foreground">OGN</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatPercent(concentration.top50Ogn)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
              <span className="text-muted-foreground">TOR</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {formatPercent(concentration.top50Tor)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top 100 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Top 100 Holders</span>
            <span className="text-2xl font-bold text-primary">
              {formatPercent(concentration.top100Percentage)}%
            </span>
          </div>
          <Progress value={concentration.top100Percentage ?? 0} className="h-3" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatPercent(concentration.top100Shares)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
              <span className="text-muted-foreground">OGN</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatPercent(concentration.top100Ogn)}%
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
              <span className="text-muted-foreground">TOR</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {formatPercent(concentration.top100Tor)}%
              </span>
            </div>
          </div>
        </div>

        {/* Info note when high concentration */}
        {(concentration.top10Percentage ?? 0) >= 90 && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            Tập trung cao: Số lượng ít holders sở hữu phần lớn tài sản
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConcentrationSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-14 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
