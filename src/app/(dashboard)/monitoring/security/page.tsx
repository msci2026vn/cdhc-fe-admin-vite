

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  AlertTriangle,
  Lock,
  Activity,
  Users,
  ArrowLeft,
  Globe,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useSecurityOverview,
  useSecurityLogs,
  useSecuritySessions,
  useRevokeSession,
  useIPWhitelist,
  useAddToIPWhitelist,
  useRemoveFromIPWhitelist,
} from '@/hooks/useMonitoring';
import { formatDate } from '@/lib/utils';

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getEventIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    default:
      return 'text-blue-500';
  }
}

export default function SecurityPage() {
  const navigate = useNavigate();
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [addIPDialogOpen, setAddIPDialogOpen] = useState(false);
  const [newIPAddress, setNewIPAddress] = useState('');
  const [newIPDescription, setNewIPDescription] = useState('');
  const [removeIPDialogOpen, setRemoveIPDialogOpen] = useState(false);
  const [selectedIPId, setSelectedIPId] = useState<string | null>(null);

  const { data: overview, isLoading: overviewLoading, isError: overviewError } = useSecurityOverview();
  const { data: logs, isLoading: logsLoading } = useSecurityLogs({
    event_type: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
    severity: severityFilter === 'all' ? undefined : severityFilter,
    limit: 50,
  });
  const { data: sessions, isLoading: sessionsLoading } = useSecuritySessions();
  const { data: whitelist, isLoading: whitelistLoading } = useIPWhitelist();

  const revokeSession = useRevokeSession();
  const addToIPWhitelist = useAddToIPWhitelist();
  const removeFromIPWhitelist = useRemoveFromIPWhitelist();

  const handleRevokeSession = async () => {
    if (!selectedSessionId) return;
    try {
      await revokeSession.mutateAsync(selectedSessionId);
      toast.success('Session revoked');
      setRevokeDialogOpen(false);
      setSelectedSessionId(null);
    } catch {
      toast.error('Failed to revoke session');
    }
  };

  const handleAddIP = async () => {
    if (!newIPAddress) {
      toast.error('Please enter an IP address');
      return;
    }
    try {
      await addToIPWhitelist.mutateAsync({
        ip_address: newIPAddress,
        description: newIPDescription || undefined,
      });
      toast.success('IP added to whitelist');
      setAddIPDialogOpen(false);
      setNewIPAddress('');
      setNewIPDescription('');
    } catch {
      toast.error('Failed to add IP to whitelist');
    }
  };

  const handleRemoveIP = async () => {
    if (!selectedIPId) return;
    try {
      await removeFromIPWhitelist.mutateAsync(selectedIPId);
      toast.success('IP removed from whitelist');
      setRemoveIPDialogOpen(false);
      setSelectedIPId(null);
    } catch {
      toast.error('Failed to remove IP from whitelist');
    }
  };

  const metrics = overview?.metrics;

  if (overviewLoading) {
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

  if (overviewError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Dashboard
          </h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-red-500 text-lg">Failed to load security data</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor security events and system integrity
          </p>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL/TLS</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.sslEnabled ? (
                <span className="text-green-600">Enabled</span>
              ) : (
                <span className="text-destructive">Disabled</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.sslEnabled ? 'Connection encrypted' : 'Connection not secure'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics?.failedLogins || 0}
              {(metrics?.failedLogins || 0) > 5 && (
                <Badge variant="destructive">High</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {(metrics?.failedLogins || 0) > 5 ? 'Investigate suspicious activity' : 'Within normal range'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.activeSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently logged in admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Row Level Security</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.rlsTablesCount || 0} tables
            </div>
            <p className="text-xs text-muted-foreground">
              Protected with RLS policies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="whitelist">IP Whitelist</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Events</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="failed_login">Failed Login</SelectItem>
                      <SelectItem value="suspicious_query">Suspicious Query</SelectItem>
                      <SelectItem value="permission_change">Permission Change</SelectItem>
                      <SelectItem value="session_revoked">Session Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : !logs?.logs || logs.logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No security events logged
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Activity
                          className={`w-5 h-5 mt-0.5 ${getEventIcon(log.severity)}`}
                        />
                        <div>
                          <p className="font-medium">{log.event_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.ip_address && `From ${log.ip_address} • `}
                            {formatDate(log.created_at)}
                          </p>
                          {log.details && (
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Admin Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <Skeleton className="h-64" />
              ) : !sessions || sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active sessions
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono">
                          {session.ip_address || 'Unknown'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.user_agent || 'Unknown'}
                        </TableCell>
                        <TableCell>{formatDate(session.created_at)}</TableCell>
                        <TableCell>{formatDate(session.expires_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              setRevokeDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Whitelist Tab */}
        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  IP Whitelist
                </CardTitle>
                <Button onClick={() => setAddIPDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add IP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {whitelistLoading ? (
                <Skeleton className="h-64" />
              ) : !whitelist || whitelist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No IPs in whitelist. All IPs are allowed.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelist.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono">
                          {entry.ip_address}
                        </TableCell>
                        <TableCell>{entry.description || '-'}</TableCell>
                        <TableCell>{formatDate(entry.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedIPId(entry.id);
                              setRemoveIPDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revoke Session Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Revoke Session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately log out this admin session. They will need to
              log in again to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleRevokeSession}
              disabled={revokeSession.isPending}
            >
              {revokeSession.isPending ? 'Revoking...' : 'Revoke Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add IP Dialog */}
      <AlertDialog open={addIPDialogOpen} onOpenChange={setAddIPDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add IP to Whitelist</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">IP Address</label>
                  <Input
                    placeholder="e.g., 192.168.1.1"
                    value={newIPAddress}
                    onChange={(e) => setNewIPAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    placeholder="e.g., Office network"
                    value={newIPDescription}
                    onChange={(e) => setNewIPDescription(e.target.value)}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddIP}
              disabled={addToIPWhitelist.isPending || !newIPAddress}
            >
              {addToIPWhitelist.isPending ? 'Adding...' : 'Add IP'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove IP Dialog */}
      <AlertDialog open={removeIPDialogOpen} onOpenChange={setRemoveIPDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Remove IP from Whitelist?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This IP address will no longer be whitelisted. If IP restriction is
              enabled, access from this IP may be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleRemoveIP}
              disabled={removeFromIPWhitelist.isPending}
            >
              {removeFromIPWhitelist.isPending ? 'Removing...' : 'Remove IP'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
