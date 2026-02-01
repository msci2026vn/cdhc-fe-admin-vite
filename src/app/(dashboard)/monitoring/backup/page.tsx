

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Database,
  Download,
  Trash2,
  RefreshCcw,
  AlertTriangle,
  ArrowLeft,
  HardDrive,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useBackupList,
  useCreateBackup,
  useRestoreBackup,
  useDeleteBackup,
  formatBytes,
} from '@/hooks/useMonitoring';
import { formatDate } from '@/lib/utils';

interface Backup {
  id: string;
  filename: string;
  size: number;
  type: 'manual' | 'scheduled';
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
  storage_location?: string;
}

export default function BackupPage() {
  const navigate = useNavigate();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const { data: backups, isLoading, isError, refetch } = useBackupList();
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();
  const deleteBackup = useDeleteBackup();

  const handleCreateBackup = async () => {
    try {
      await createBackup.mutateAsync();
      toast.success('Backup created successfully!');
    } catch {
      toast.error('Failed to create backup');
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    try {
      await restoreBackup.mutateAsync(selectedBackup.id);
      toast.success('Database restored successfully!');
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    } catch {
      toast.error('Failed to restore backup');
    }
  };

  const handleDelete = async () => {
    if (!selectedBackup) return;
    try {
      await deleteBackup.mutateAsync(selectedBackup.id);
      toast.success('Backup deleted');
      setDeleteDialogOpen(false);
      setSelectedBackup(null);
    } catch {
      toast.error('Failed to delete backup');
    }
  };

  const backupList = (backups || []) as Backup[];
  const completedBackups = backupList.filter((b) => b.status === 'completed');
  const totalSize = completedBackups.reduce((sum, b) => sum + (b.size || 0), 0);

  if (isLoading) {
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

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Backups
          </h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-red-500 text-lg">Failed to load backups</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
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
              <Database className="h-6 w-6 text-blue-600" />
              Database Backups
            </h1>
            <p className="text-muted-foreground">
              Manage database backups and restore points
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={createBackup.isPending}
        >
          {createBackup.isPending ? (
            <>
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Create Backup
            </>
          )}
        </Button>
      </div>

      {/* Backup Configuration Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Automatic Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Enabled</p>
            <p className="text-sm text-muted-foreground">Daily at 2:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Retention Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">7 days</p>
            <p className="text-sm text-muted-foreground">Oldest auto-deleted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold font-mono">Vultr Object Storage</p>
            <p className="text-sm text-muted-foreground">Encrypted at rest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedBackups.length}</p>
            <p className="text-sm text-muted-foreground">
              {formatBytes(totalSize)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Backups</CardTitle>
        </CardHeader>
        <CardContent>
          {backupList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups found. Create your first backup now!
            </div>
          ) : (
            <div className="space-y-3">
              {backupList.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Database className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium font-mono text-sm">
                        {backup.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {formatBytes(backup.size || 0)}
                        </Badge>
                        <Badge
                          variant={backup.type === 'manual' ? 'default' : 'outline'}
                        >
                          {backup.type}
                        </Badge>
                        <Badge
                          variant={
                            backup.status === 'completed'
                              ? 'default'
                              : backup.status === 'in_progress'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={
                            backup.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {backup.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(backup.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {backup.storage_location && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(backup.storage_location, '_blank')
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {backup.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setRestoreDialogOpen(true);
                        }}
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Restore Database?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>This will replace the current database with the backup:</p>
                <div className="mt-4 p-3 bg-muted rounded-md font-mono text-sm">
                  {selectedBackup?.filename}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-destructive font-semibold">WARNING:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All current data will be replaced</li>
                    <li>This action cannot be undone</li>
                    <li>Create a new backup before proceeding</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleRestore}
              disabled={restoreBackup.isPending}
            >
              {restoreBackup.isPending ? 'Restoring...' : 'Restore Database'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Backup?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Are you sure you want to delete this backup?</p>
                <div className="mt-4 p-3 bg-muted rounded-md font-mono text-sm">
                  {selectedBackup?.filename}
                </div>
                <p className="mt-4 text-sm text-destructive">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteBackup.isPending}
            >
              {deleteBackup.isPending ? 'Deleting...' : 'Delete Backup'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
