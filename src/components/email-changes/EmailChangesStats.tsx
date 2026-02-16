import { Clock, CheckCircle, AlertTriangle, XCircle, Lock, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmailChangesStatsData } from '@/lib/api';

interface Props {
  data: EmailChangesStatsData | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'total',
    label: 'Tổng yêu cầu',
    icon: CalendarDays,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  { key: 'pending', label: 'Đang chờ', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  {
    key: 'completed',
    label: 'Đã duyệt',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    key: 'disputed',
    label: 'Tranh chấp',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    key: 'lockedPhones',
    label: 'SĐT bị khóa',
    icon: Lock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    key: 'todayRequests',
    label: 'Hôm nay',
    icon: CalendarDays,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
] as const;

export function EmailChangesStats({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.key} className="rounded-lg border bg-white p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = data?.[card.key] ?? 0;
        return (
          <div key={card.key} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
