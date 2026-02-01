

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRecoveryStats } from '@/hooks/useLegacyRecovery';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export function RecoveryStatsCards() {
  const { data: stats, isLoading, error } = useRecoveryStats();

  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  if (error || !stats) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Không thể tải thống kê khôi phục</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Tổng số thành viên Legacy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng thành viên Legacy
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Thành viên trong hệ thống cũ
          </p>
        </CardContent>
      </Card>

      {/* Đã khôi phục - Link to page */}
      {stats.restored > 0 ? (
        <Link to="/legacy-recovery/restored">
          <Card className="cursor-pointer hover:border-green-400 hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Đã khôi phục
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.restored.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Xem danh sách <ChevronRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Đã khôi phục
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.restored.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Khôi phục thành công
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chưa khôi phục */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Chưa khôi phục
          </CardTitle>
          <UserX className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.notRestored.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Chờ khôi phục
          </p>
        </CardContent>
      </Card>

      {/* Tỷ lệ khôi phục */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Tỷ lệ khôi phục
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.recoveryRate < 1
              ? stats.recoveryRate.toFixed(2)
              : stats.recoveryRate.toFixed(1)}%
          </div>
          <Progress
            value={stats.recoveryRate}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stats.recoveryRate === 0 ? 'Chưa có - Cần hành động!' :
             stats.recoveryRate < 1 ? 'Bắt đầu - Tiếp tục!' :
             stats.recoveryRate < 10 ? 'Rất thấp - Cần cải thiện' :
             stats.recoveryRate < 50 ? 'Thấp - Cần cải thiện' :
             stats.recoveryRate < 80 ? 'Trung bình' :
             'Tốt'}
          </p>
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
