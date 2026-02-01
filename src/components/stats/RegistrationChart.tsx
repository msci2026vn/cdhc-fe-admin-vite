

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStats } from '@/hooks/useStats';

export function RegistrationChart() {
  const { data, isLoading } = useStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const registrations = data?.data?.registrations;
  const chartData = [
    { name: 'Hôm nay', value: registrations?.today || 0 },
    { name: 'Tuần này', value: registrations?.thisWeek || 0 },
    { name: 'Tháng này', value: registrations?.thisMonth || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
