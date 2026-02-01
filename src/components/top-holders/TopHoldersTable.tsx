

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTopHoldersList, useSearchHolders } from '@/hooks/useTopHolders';
import { TopHolderData } from '@/lib/api';
import {
  Search,
  TrendingUp,
  Medal,
  Crown,
  Trophy,
  AlertCircle
} from 'lucide-react';

export function TopHoldersTable() {
  const [limit, setLimit] = useState(100);
  const [sortBy, setSortBy] = useState<'shares' | 'ogn' | 'tor' | 'total'>('total');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: listData, isLoading: isLoadingList, error } = useTopHoldersList(limit, sortBy);
  const { data: searchData, isLoading: isLoadingSearch } = useSearchHolders(searchQuery);

  const isLoading = searchQuery ? isLoadingSearch : isLoadingList;
  const holders = searchQuery ? (searchData?.holders || []) : (listData?.holders || []);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Không thể tải danh sách top holders</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bảng xếp hạng Top Holders
            {!searchQuery && (
              <Badge variant="outline">
                Top {limit}
              </Badge>
            )}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort By */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Tổng</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
                <SelectItem value="ogn">OGN</SelectItem>
                <SelectItem value="tor">TOR</SelectItem>
              </SelectContent>
            </Select>

            {/* Limit */}
            <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
                <SelectItem value="100">Top 100</SelectItem>
                <SelectItem value="500">Top 500</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm email hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : holders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'Không tìm thấy holder' : 'Không có dữ liệu'}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium w-20">Hạng</th>
                  <th className="p-3 text-left font-medium">Holder</th>
                  <th className="p-3 text-left font-medium">Cấp bậc</th>
                  <th className="p-3 text-right font-medium">Shares</th>
                  <th className="p-3 text-right font-medium">OGN</th>
                  <th className="p-3 text-right font-medium">TOR</th>
                  <th className="p-3 text-right font-medium">Tổng tài sản</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((holder) => (
                  <HolderRow key={holder.id} holder={holder} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HolderRow({ holder }: { holder: TopHolderData }) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
    if (rank === 2) return 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-700';
    if (rank === 3) return 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
    return '';
  };

  const getBadgeVariant = (legacyRank: string) => {
    if (legacyRank === 'CO-FOUNDER') return 'default';
    if (legacyRank === 'VIP') return 'secondary';
    return 'outline';
  };

  return (
    <tr className={`border-b hover:bg-muted/50 transition-colors ${getRankColor(holder.rank)}`}>
      <td className="p-3">
        <div className="flex items-center gap-2 font-bold">
          {getRankIcon(holder.rank)}
          #{holder.rank}
        </div>
      </td>
      <td className="p-3">
        <div>
          <div className="font-medium">{holder.name || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">{holder.email}</div>
        </div>
      </td>
      <td className="p-3">
        <Badge variant={getBadgeVariant(holder.legacyRank)}>
          {holder.legacyRank}
        </Badge>
      </td>
      <td className="p-3 text-right font-mono text-sm">
        {formatNumber(holder.shares)}
      </td>
      <td className="p-3 text-right font-mono text-sm text-green-600">
        {formatNumber(holder.ogn)}
      </td>
      <td className="p-3 text-right font-mono text-sm text-purple-600">
        {formatNumber(holder.tor)}
      </td>
      <td className="p-3 text-right font-mono font-bold">
        {formatNumber(holder.totalAssets)}
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}
