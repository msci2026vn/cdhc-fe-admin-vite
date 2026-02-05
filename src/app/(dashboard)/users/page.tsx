import { useState, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserFilters } from '@/components/users/UserFilters';
import { UserTable } from '@/components/users/UserTable';
import { UserActionsDialog } from '@/components/users/UserActions';
import { BulkActions } from '@/components/users/BulkActions';
import { Pagination } from '@/components/users/Pagination';
import { useUsers } from '@/hooks/useUsers';
import { usePermission } from '@/hooks/usePermission';
import { api } from '@/lib/api';
import { debounce } from '@/lib/utils';
import { toast } from 'sonner';
import type { User } from '@/types/user';

type ActionType = 'approve' | 'reject' | 'suspend' | 'activate' | 'delete' | null;

export default function UsersPage() {
  const { canExport } = usePermission();

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [orgType, setOrgType] = useState('all');
  const [hasPendingRole, setHasPendingRole] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action dialog
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);

  // Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSetSearch(value);
      setPage(1);
    },
    [debouncedSetSearch],
  );

  const handleRoleChange = useCallback((value: string) => {
    setRole(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleOrgTypeChange = useCallback((value: string) => {
    setOrgType(value);
    setPage(1);
  }, []);

  const handleHasPendingRoleChange = useCallback((value: boolean) => {
    setHasPendingRole(value);
    setPage(1);
  }, []);

  // Fetch users
  const { data, isLoading } = useUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    role: role !== 'all' ? role : undefined,
    status: status !== 'all' ? status : undefined,
    orgType: orgType !== 'all' ? (orgType as 'individual' | 'organization') : undefined,
    hasPendingRole: hasPendingRole || undefined,
  });

  const users = useMemo(() => data?.data || [], [data?.data]);
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  // Selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(users.map((u) => u.id));
      } else {
        setSelectedIds([]);
      }
    },
    [users],
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  // Action handlers
  const openAction = useCallback((user: User, action: ActionType) => {
    setSelectedUser(user);
    setActionType(action);
  }, []);

  const closeAction = useCallback(() => {
    setSelectedUser(null);
    setActionType(null);
  }, []);

  // Export handler
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (role !== 'all') params.set('role', role);
      if (status !== 'all') params.set('status', status);
      if (orgType !== 'all') params.set('orgType', orgType);
      if (hasPendingRole) params.set('hasPendingRole', 'true');
      if (debouncedSearch) params.set('search', debouncedSearch);

      await api.downloadFile(
        `/api/admin/export/users?${params.toString()}`,
        `users_${new Date().toISOString().split('T')[0]}.xlsx`,
      );
      toast.success('Đã xuất file Excel thành công');
    } catch {
      toast.error('Không thể xuất file. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
          <p className="text-gray-500">Quản lý tất cả thành viên trong hệ thống</p>
        </div>
        {canExport() && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        )}
      </div>

      <UserFilters
        search={search}
        role={role}
        status={status}
        orgType={orgType}
        hasPendingRole={hasPendingRole}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onOrgTypeChange={handleOrgTypeChange}
        onHasPendingRoleChange={handleHasPendingRoleChange}
      />

      <BulkActions selectedIds={selectedIds} onClearSelection={() => setSelectedIds([])} />

      <UserTable
        users={users}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onApprove={(user) => openAction(user, 'approve')}
        onReject={(user) => openAction(user, 'reject')}
        onSuspend={(user) => openAction(user, 'suspend')}
        onActivate={(user) => openAction(user, 'activate')}
        onDelete={(user) => openAction(user, 'delete')}
      />

      {pagination.totalPages > 0 && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      <UserActionsDialog user={selectedUser} action={actionType} onClose={closeAction} />
    </div>
  );
}
