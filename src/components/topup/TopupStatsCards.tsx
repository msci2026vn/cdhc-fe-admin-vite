import { ShoppingCart, CheckCircle, XCircle, Clock, Coins, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { TopupStatsData } from '@/types/topup';

interface Props {
  data: TopupStatsData | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'totalOrders',
    label: 'Tong orders',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    getValue: (d: TopupStatsData) => d.totalOrders,
  },
  {
    key: 'completed',
    label: 'Hoan thanh',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    getValue: (d: TopupStatsData) => d.completedOrders,
  },
  {
    key: 'failed',
    label: 'That bai',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    getValue: (d: TopupStatsData) => d.failedOrders,
  },
  {
    key: 'pending',
    label: 'Dang cho',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    getValue: (d: TopupStatsData) => d.pendingOrders,
  },
  {
    key: 'totalAvax',
    label: 'Tong AVAX da chuyen',
    icon: Coins,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    getValue: (d: TopupStatsData) => d.totalAvax ?? 0,
    format: (v: number) => `${(v ?? 0).toFixed(2)} AVAX`,
  },
  {
    key: 'totalUsd',
    label: 'Tong USD thu',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    getValue: (d: TopupStatsData) => (d.totalUsdCents ?? 0) / 100,
    format: (v: number) => `$${(v ?? 0).toFixed(2)}`,
  },
] as const;

export function TopupStatsCards({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.key} className="rounded-lg border bg-white p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = data ? card.getValue(data) : 0;
        const formatted =
          'format' in card && card.format ? card.format(value) : formatNumber(value);
        return (
          <div key={card.key} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatted}</p>
          </div>
        );
      })}
    </div>
  );
}
