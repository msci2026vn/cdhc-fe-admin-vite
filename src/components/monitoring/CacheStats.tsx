

import { Server, Trash2, Zap, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCacheStats, useFlushCache } from '@/hooks/useMonitoring';
import { useIsSuperAdmin } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function CacheStatsCard() {
  const { data: cache, isLoading, isError } = useCacheStats();
  const flushCache = useFlushCache();
  const isSuperAdmin = useIsSuperAdmin();

  const handleFlushCache = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ cache?')) {
      return;
    }

    try {
      const result = await flushCache.mutateAsync('*');
      toast.success(`Đã xóa ${result.keysDeleted || 0} keys`);
    } catch (error) {
      toast.error(`Không thể xóa cache: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Redis Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !cache) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Redis Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Không thể tải thông tin cache
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-red-600" />
            Redis Cache
            <Badge variant={cache.connected ? 'default' : 'destructive'} className="ml-2">
              {cache.connected ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Đã kết nối</>
              ) : (
                <><AlertTriangle className="h-3 w-3 mr-1" /> Mất kết nối</>
              )}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Bộ nhớ đệm Redis để tăng tốc truy xuất dữ liệu
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlushCache}
            disabled={flushCache.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa cache
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keys & Memory Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Tổng số Keys</div>
            <div className="text-2xl font-bold text-blue-600">
              {cache.keys.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Bộ nhớ sử dụng</div>
            <div className="text-2xl font-bold text-purple-600">
              {cache.usedMemoryHuman}
            </div>
            <div className="text-xs text-muted-foreground">
              / {cache.maxMemoryHuman}
            </div>
          </div>
        </div>

        {/* Memory Usage Progress */}
        {cache.memoryUsagePercent > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Sử dụng bộ nhớ</span>
              <span className="font-medium">
                {cache.memoryUsagePercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={cache.memoryUsagePercent} className="h-2" />
          </div>
        )}

        {/* Hit Rate - Highlighted */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Tỷ lệ trúng cache (Hit Rate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              {cache.hitRate.toFixed(1)}%
            </span>
            <Badge variant="outline" className="text-xs">
              {cache.hits.toLocaleString()} hits
            </Badge>
          </div>
        </div>

        {/* Hit Rate Progress */}
        <div>
          <Progress value={cache.hitRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Hits: {cache.hits.toLocaleString()}</span>
            <span>Misses: {cache.misses.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-xs text-muted-foreground">Clients kết nối</div>
              <div className="text-sm font-medium">{cache.connectedClients}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${cache.evictedKeys > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            <div>
              <div className="text-xs text-muted-foreground">Keys bị loại bỏ</div>
              <div className={`text-sm font-medium ${cache.evictedKeys > 0 ? 'text-orange-600' : ''}`}>
                {cache.evictedKeys.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-xs text-muted-foreground">Keys hết hạn</div>
              <div className="text-sm font-medium">{cache.expiredKeys.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-xs text-muted-foreground">Thời gian chạy</div>
              <div className="text-sm font-medium">{cache.uptimeHuman}</div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Redis v{cache.version}
        </div>
      </CardContent>
    </Card>
  );
}
