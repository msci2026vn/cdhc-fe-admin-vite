

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateAlertConfig } from '@/hooks/useMonitoring';

interface AlertConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertConfigDialog({ open, onOpenChange }: AlertConfigDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    metric: 'database_size',
    condition: 'greater_than',
    threshold: '',
    severity: 'medium',
    notification_emails: '',
  });

  const createMutation = useCreateAlertConfig();

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    if (!formData.threshold) {
      toast.error('Threshold is required');
      return;
    }

    const thresholdValue = parseFloat(formData.threshold);

    // Validate threshold is a valid number
    if (isNaN(thresholdValue)) {
      toast.error('Threshold must be a valid number');
      return;
    }

    // Validate threshold is positive
    if (thresholdValue <= 0) {
      toast.error('Threshold must be greater than 0');
      return;
    }

    // Validate email format if provided
    if (formData.notification_emails.trim()) {
      const emails = formData.notification_emails.split(',').map((e) => e.trim()).filter(Boolean);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter((email) => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email format: ${invalidEmails.join(', ')}`);
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        ...formData,
        threshold: thresholdValue,
        notification_emails: formData.notification_emails
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean),
      });
      toast.success('Alert rule created');
      onOpenChange(false);
      setFormData({
        name: '',
        metric: 'database_size',
        condition: 'greater_than',
        threshold: '',
        severity: 'medium',
        notification_emails: '',
      });
    } catch {
      toast.error('Failed to create alert rule');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Rule Name</Label>
            <Input
              placeholder="e.g., Database Size Warning"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Metric</Label>
              <Select
                value={formData.metric}
                onValueChange={(value) =>
                  setFormData({ ...formData, metric: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database_size">
                    Database Size (MB)
                  </SelectItem>
                  <SelectItem value="slow_query_count">
                    Slow Query Count
                  </SelectItem>
                  <SelectItem value="connection_usage">
                    Connection Usage (%)
                  </SelectItem>
                  <SelectItem value="failed_backup">Failed Backups</SelectItem>
                  <SelectItem value="failed_login">Failed Logins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData({ ...formData, condition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Threshold</Label>
              <Input
                type="number"
                placeholder="100"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({ ...formData, threshold: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  setFormData({ ...formData, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notification Emails (comma-separated)</Label>
            <Input
              placeholder="admin@cdhc.vn, tech@cdhc.vn"
              value={formData.notification_emails}
              onChange={(e) =>
                setFormData({ ...formData, notification_emails: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name || !formData.threshold || createMutation.isPending
              }
            >
              {createMutation.isPending ? 'Creating...' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
