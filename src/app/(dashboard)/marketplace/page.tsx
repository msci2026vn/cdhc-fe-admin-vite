import { useState } from 'react';
import { Store, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useMarketplaceStats,
  useMarketplaceListings,
  useMarketplaceWithdrawals,
  useForceCancel,
} from '@/hooks/useMarketplaceAdmin';
import type { MarketplaceListing, MarketplaceWithdrawal } from '@/lib/api';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  return Math.floor(diff / 86400) + ' ngày trước';
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Đang bán', color: 'bg-green-600' },
  processing: { label: 'Processing', color: 'bg-yellow-600' },
  sold: { label: 'Đã bán', color: 'bg-blue-600' },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-600' },
};

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang bán' },
  { key: 'processing', label: 'Processing' },
  { key: 'sold', label: 'Đã bán' },
  { key: 'cancelled', label: 'Đã hủy' },
];

function SnowscanLink({ hash, label }: { hash: string; label: string }) {
  return (
    <a
      href={`https://snowscan.xyz/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
    >
      {label} <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export default function MarketplacePage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: statsData, isLoading: statsLoading } = useMarketplaceStats();
  const { data: listingsData, isLoading: listingsLoading } = useMarketplaceListings(filterStatus);
  const { data: withdrawalsData } = useMarketplaceWithdrawals();
  const forceCancel = useForceCancel();

  const stats = statsData?.data?.stats;
  const listings: MarketplaceListing[] = (listingsData?.data as any)?.listings ?? [];
  const withdrawals: MarketplaceWithdrawal[] = (withdrawalsData?.data as any)?.withdrawals ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Store className="w-7 h-7 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-100">Quản lý Chợ NFT</h1>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="text-gray-400">Đang tải thống kê...</div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.active_count}</div>
              <div className="text-sm text-gray-400">Đang bán</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.sold_count}</div>
              <div className="text-sm text-gray-400">Đã bán</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-400">{stats.cancelled_count}</div>
              <div className="text-sm text-gray-400">Đã hủy</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {Number(stats.total_volume_avax).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">AVAX Volume</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={filterStatus === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(tab.key)}
            className={
              filterStatus === tab.key
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Listings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4 space-y-0 divide-y divide-gray-700">
          {listingsLoading ? (
            <div className="text-gray-400 py-4">Đang tải listings...</div>
          ) : listings.length === 0 ? (
            <div className="text-gray-500 py-4">Không có listing nào</div>
          ) : (
            listings.map((l) => (
              <div key={l.id} className="py-3 space-y-1">
                {/* Row 1: Token + Boss + Status + Price */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {l.nft_card_image_url && (
                      <img
                        src={l.nft_card_image_url}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span className="text-gray-100 font-medium">
                      Token #{l.token_id}
                      {l.boss_name && <span className="text-gray-400"> — {l.boss_name}</span>}
                    </span>
                    <Badge className={STATUS_CONFIG[l.status]?.color ?? 'bg-gray-600'}>
                      {STATUS_CONFIG[l.status]?.label ?? l.status}
                    </Badge>
                  </div>
                  <span className="text-amber-400 font-bold">{l.price_avax} AVAX</span>
                </div>

                {/* Row 2: Seller → Buyer + Time */}
                <div className="text-sm text-gray-400">
                  Seller: {l.seller_name ?? 'N/A'}
                  {l.buyer_name && <> → Buyer: {l.buyer_name}</>}
                  {' | '}
                  {timeAgo(l.listed_at)}
                  {l.sold_at && <> | Sold: {timeAgo(l.sold_at)}</>}
                </div>

                {/* Row 3: Tx hashes */}
                {(l.nft_tx_hash || l.sold_tx_hash) && (
                  <div className="flex gap-3">
                    {l.nft_tx_hash && <SnowscanLink hash={l.nft_tx_hash} label="NFT tx" />}
                    {l.sold_tx_hash && <SnowscanLink hash={l.sold_tx_hash} label="AVAX tx" />}
                  </div>
                )}

                {/* Row 4: Force cancel */}
                {(l.status === 'active' || l.status === 'processing') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2"
                        disabled={forceCancel.isPending}
                      >
                        Force Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-100">
                          Hủy listing #{l.token_id}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Listing sẽ bị hủy và không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-600">Không</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => forceCancel.mutate(l.id)}
                        >
                          Hủy listing
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Withdrawals */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          Lịch sử rút NFT
        </h2>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 space-y-0 divide-y divide-gray-700">
            {withdrawals.length === 0 ? (
              <div className="text-gray-500 py-4">Chưa có ai rút NFT</div>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="py-2 text-sm flex items-center gap-2 flex-wrap">
                  <span className="text-gray-100">Token #{w.token_id}</span>
                  <span className="text-gray-400">
                    → {w.to_address?.slice(0, 6)}...{w.to_address?.slice(-4)}
                  </span>
                  <span className="text-gray-400">| {w.user_name ?? 'N/A'}</span>
                  <span className="text-gray-500">| {timeAgo(w.created_at)}</span>
                  {w.tx_hash && <SnowscanLink hash={w.tx_hash} label="Snowscan" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
