

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAlertCheck,
  useAlertConfigurations,
  useAlertHistory,
  useAcknowledgeAlert,
  useSnoozeAlert,
} from '@/hooks/useMonitoring';
import { formatDate } from '@/lib/utils';
import { AlertConfigDialog } from '@/components/monitoring/AlertConfigDialog';

interface Alert {
  id: string;
  metric: string;
  current_value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'snoozed' | 'resolved';
  created_at: string;
  snoozed_until?: string;
}

const severityColor: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const severityIcon: Record<string, string> = {
  low: '',
  medium: '',
  high: '',
  critical: '',
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const { data: alertsData, isLoading: alertsLoading } = useAlertCheck();
  const { data: configsData, isLoading: configsLoading } = useAlertConfigurations();
  const { data: historyData, isLoading: historyLoading } = useAlertHistory();

  const acknowledgeMutation = useAcknowledgeAlert();
  const snoozeMutation = useSnoozeAlert();

  // Request browser notification permission on page load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Browser notification on new critical alert
  useEffect(() => {
    if (alertsData?.alerts && alertsData.alerts.length > 0) {
      const criticalAlerts = alertsData.alerts.filter(
        (a: Alert) => a.severity === 'critical' && a.status === 'active'
      );

      if (criticalAlerts.length > 0 && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Critical Alert', {
            body: criticalAlerts[0].message,
            icon: '/favicon.ico',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    }
  }, [alertsData]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(alertId);
      toast.success('Alert acknowledged');
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleSnooze = async (alertId: string, minutes: number) => {
    try {
      await snoozeMutation.mutateAsync({ alertId, minutes });
      toast.success(`Alert snoozed for ${minutes} minutes`);
    } catch {
      toast.error('Failed to snooze alert');
    }
  };

  if (alertsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-yellow-600" />
              Alerts & Notifications
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage system alerts
            </p>
          </div>
        </div>
        <Button onClick={() => setConfigDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Alert Rule
        </Button>
      </div>

      {/* Active Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
          const count =
            alertsData?.alerts?.filter(
              (a: Alert) => a.severity === severity && a.status === 'active'
            ).length || 0;

          return (
            <Card key={severity}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {severity}
                </CardTitle>
                <AlertTriangle
                  className={`w-4 h-4 ${
                    count > 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {severityIcon[severity]} {count}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Alerts ({alertsData?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="configurations">
            Alert Rules ({configsData?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {!alertsData?.alerts || alertsData.alerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">All systems operational</p>
                  <p className="text-sm">No active alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertsData.alerts.map((alert: Alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start justify-between p-4 border-l-4 ${severityColor[alert.severity]} rounded-lg bg-card`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              alert.severity === 'critical'
                                ? 'destructive'
                                : alert.severity === 'high'
                                ? 'destructive'
                                : alert.severity === 'medium'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {severityIcon[alert.severity]}{' '}
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(alert.created_at)}
                          </span>
                        </div>
                        <p className="font-medium">{alert.message}</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span>Current: {alert.current_value.toFixed(2)}</span>
                          <span className="mx-2">-</span>
                          <span>Threshold: {alert.threshold}</span>
                          <span className="mx-2">-</span>
                          <span className="font-mono">{alert.metric}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSnooze(alert.id, 60)}
                          disabled={snoozeMutation.isPending}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Snooze 1h
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : !configsData || configsData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No alert rules configured. Create one to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {configsData.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{config.name}</p>
                          <Badge
                            variant={config.enabled ? 'default' : 'secondary'}
                          >
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Badge variant="outline">{config.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.metric} {config.condition.replace('_', ' ')}{' '}
                          {config.threshold}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Notify:{' '}
                          {config.notification_emails?.join(', ') ||
                            'No recipients'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : !historyData?.history || historyData.history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No alert history
                </div>
              ) : (
                <div className="space-y-2">
                  {historyData.history.map((alert: Alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            alert.status === 'resolved'
                              ? 'outline'
                              : alert.status === 'acknowledged'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {alert.status}
                        </Badge>
                        <span className="font-medium">{alert.message}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(alert.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
      />
    </div>
  );
}
