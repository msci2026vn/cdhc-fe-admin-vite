import { ArrowLeftRight, Sprout, Coins, XCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { ConversionStatsData } from '@/types/conversion';

interface Props {
  data: ConversionStatsData | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'conversions',
    label: 'Giao dịch hôm nay',
    icon: ArrowLeftRight,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    getValue: (d: ConversionStatsData) => d.today.totalConversions,
  },
  {
    key: 'seedBurn',
    label: 'Seed burn hôm nay',
    icon: Sprout,
    color: 'text-green-600',
    bg: 'bg-green-50',
    getValue: (d: ConversionStatsData) => d.today.totalFeesSeed,
  },
  {
    key: 'ognBurn',
    label: 'OGN burn hôm nay',
    icon: Coins,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    getValue: (d: ConversionStatsData) => d.today.totalFeesOgn,
  },
  {
    key: 'failed',
    label: 'Failed hôm nay',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    getValue: (d: ConversionStatsData) => d.today.failedAttempts,
  },
  {
    key: 'alerts',
    label: 'Alerts mở',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    getValue: (d: ConversionStatsData) => d.alerts.openCritical + d.alerts.openWarning,
  },
] as const;

export function ConversionStatsCards({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = data ? card.getValue(data) : 0;
        return (
          <div key={card.key} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatNumber(value)}</p>
          </div>
        );
      })}
    </div>
  );
}
