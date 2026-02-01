

import { Activity, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStats } from '@/hooks/useStats';
import { formatNumber } from '@/lib/utils';

export function OnlineStats() {
  const { data, isLoading } = useStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động trực tuyến</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const online = data?.data?.online;

  const stats = [
    {
      label: 'Đang online',
      value: online?.now || 0,
      icon: Activity,
      color: 'text-green-600',
    },
    {
      label: 'Hôm nay',
      value: online?.today || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Tuần này',
      value: online?.thisWeek || 0,
      icon: Calendar,
      color: 'text-purple-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động trực tuyến</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-gray-600">{stat.label}</span>
                </div>
                <span className="text-xl font-bold">
                  {formatNumber(stat.value)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
