

import { Users, UserCheck, UserX, UserMinus, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStats } from '@/hooks/useStats';
import { formatNumber } from '@/lib/utils';

const statsConfig = [
  {
    key: 'total',
    label: 'Tổng thành viên',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    key: 'approved',
    label: 'Đã duyệt',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    key: 'pending',
    label: 'Chờ duyệt',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    key: 'rejected',
    label: 'Từ chối',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    key: 'suspended',
    label: 'Đình chỉ',
    icon: UserMinus,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
];

export function StatsCards() {
  const { data, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsConfig.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        Không thể tải thống kê. Vui lòng thử lại.
      </div>
    );
  }

  const overview = data.data?.overview;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        const value = overview?.[stat.key as keyof typeof overview] ?? 0;

        return (
          <Card key={stat.key}>
            <CardContent className="p-6">
              <div className={`inline-flex rounded-lg p-3 ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-4 text-2xl font-bold">{formatNumber(value)}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
