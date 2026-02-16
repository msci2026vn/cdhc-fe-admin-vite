import { useState, useCallback, useMemo } from 'react';
import { EmailChangesStats } from '@/components/email-changes/EmailChangesStats';
import { EmailChangesFilters } from '@/components/email-changes/EmailChangesFilters';
import { EmailChangesTable } from '@/components/email-changes/EmailChangesTable';
import { EmailChangeDetail } from '@/components/email-changes/EmailChangeDetail';
import { LockedAttempts } from '@/components/email-changes/LockedAttempts';
import { Pagination } from '@/components/users/Pagination';
import { useEmailChangesStats, useEmailChangesList } from '@/hooks/useEmailChanges';
import { debounce } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { EmailChangeRequest } from '@/lib/api';

type TabType = 'requests' | 'locked';

export default function EmailChangesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('requests');

  // List filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Detail dialog
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleFromChange = useCallback((value: string) => {
    setFrom(value);
    setPage(1);
  }, []);

  const handleToChange = useCallback((value: string) => {
    setTo(value);
    setPage(1);
  }, []);

  // Fetch data
  const { data: statsResponse, isLoading: statsLoading } = useEmailChangesStats();
  const { data: listResponse, isLoading: listLoading } = useEmailChangesList({
    page,
    limit,
    status: status !== 'all' ? status : undefined,
    search: debouncedSearch || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const requests = useMemo(() => listResponse?.data || [], [listResponse?.data]);
  const pagination = (
    listResponse as unknown as {
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }
  )?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  const handleViewDetail = useCallback((req: EmailChangeRequest) => {
    setSelectedId(req.id);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quản lý Khôi phục Email</h1>
        <p className="text-gray-500">
          Quản lý yêu cầu đổi email, theo dõi tranh chấp và IP bị khóa
        </p>
      </div>

      {/* Stats */}
      <EmailChangesStats data={statsResponse?.data} isLoading={statsLoading} />

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'requests'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
          onClick={() => setActiveTab('requests')}
        >
          Danh sách yêu cầu
          {statsResponse?.data?.pending ? (
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
              {statsResponse.data.pending}
            </span>
          ) : null}
        </button>
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'locked'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
          onClick={() => setActiveTab('locked')}
        >
          SĐT bị khóa
          {statsResponse?.data?.lockedPhones ? (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
              {statsResponse.data.lockedPhones}
            </span>
          ) : null}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' ? (
        <>
          <EmailChangesFilters
            search={search}
            status={status}
            from={from}
            to={to}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
          />

          <EmailChangesTable
            requests={requests}
            isLoading={listLoading}
            onViewDetail={handleViewDetail}
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
        </>
      ) : (
        <LockedAttempts />
      )}

      {/* Detail Dialog */}
      <EmailChangeDetail requestId={selectedId} open={detailOpen} onClose={handleCloseDetail} />
    </div>
  );
}
