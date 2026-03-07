import { Bell, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAlerts, getSeverityColor } from '@/hooks/useMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export function AlertsList() {
  const { data, isLoading, isError } = useAlerts({ limit: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Khong the tai danh sach alerts</div>
        </CardContent>
      </Card>
    );
  }

  const recentAlerts = Array.isArray(data?.recentAlerts) ? data.recentAlerts : [];
  const unacknowledgedCount = recentAlerts.filter((a) => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-600" />
          Recent Alerts
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unacknowledgedCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.acknowledged ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      <span className="text-sm font-medium">{alert.metric}</span>
                      {alert.acknowledged && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(alert.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{alert.value.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">Threshold: {alert.threshold}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>Không có alert nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
