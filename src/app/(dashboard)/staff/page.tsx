

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffForm } from '@/components/staff/StaffForm';
import { useStaffList, useChangeStaffRole, useDeleteStaff } from '@/hooks/useStaff';
import { usePermission } from '@/hooks/usePermission';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Staff {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
  status: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  profile: {
    fullName: string | null;
    phone: string | null;
    department: string | null;
    position: string | null;
  } | null;
}

export default function StaffPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = usePermission();
  const { data, isLoading } = useStaffList();
  const changeRole = useChangeStaffRole();
  const deleteStaff = useDeleteStaff();

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [roleDialogStaff, setRoleDialogStaff] = useState<Staff | null>(null);
  const [deleteDialogStaff, setDeleteDialogStaff] = useState<Staff | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'editor'>('editor');

  // Redirect if not super admin
  if (!isSuperAdmin()) {
    navigate('/');
    return null;
  }

  const staff = data?.data || [];

  const handleView = (member: Staff) => {
    navigate(`/staff/${member.id}`);
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
    setShowForm(true);
  };

  const handleChangeRole = (member: Staff) => {
    setRoleDialogStaff(member);
    setNewRole(member.role === 'admin' ? 'editor' : 'admin');
  };

  const handleDelete = (member: Staff) => {
    setDeleteDialogStaff(member);
  };

  const confirmChangeRole = async () => {
    if (!roleDialogStaff) return;

    try {
      await changeRole.mutateAsync({ id: roleDialogStaff.id, role: newRole });
      toast.success('Đã thay đổi vai trò');
      setRoleDialogStaff(null);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialogStaff) return;

    try {
      await deleteStaff.mutateAsync(deleteDialogStaff.id);
      toast.success('Đã xóa nhân viên');
      setDeleteDialogStaff(null);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
          <p className="text-gray-500">Quản lý tài khoản admin và editor</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      <StaffTable
        staff={staff}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onChangeRole={handleChangeRole}
        onDelete={handleDelete}
      />

      <StaffForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStaff(null);
        }}
        staff={editingStaff}
      />

      {/* Change Role Dialog */}
      <Dialog open={!!roleDialogStaff} onOpenChange={() => setRoleDialogStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò</DialogTitle>
            <DialogDescription>
              Thay đổi vai trò cho {roleDialogStaff?.name || roleDialogStaff?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Vai trò mới</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'editor')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogStaff(null)}>
              Hủy
            </Button>
            <Button onClick={confirmChangeRole} disabled={changeRole.isPending}>
              {changeRole.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialogStaff} onOpenChange={() => setDeleteDialogStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa nhân viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa {deleteDialogStaff?.name || deleteDialogStaff?.email}?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogStaff(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteStaff.isPending}>
              {deleteStaff.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
