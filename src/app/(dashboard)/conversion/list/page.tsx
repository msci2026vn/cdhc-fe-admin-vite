import { useState, useCallback, useMemo } from 'react';
import {
  ConversionListFilters,
  ConversionListTable,
  ConversionDetailModal,
  UserAuditDialog,
} from '@/components/conversion';
import { Pagination } from '@/components/users/Pagination';
import { useConversionList } from '@/hooks/useConversion';
import { debounce } from '@/lib/utils';
import type { ConversionRecord } from '@/types/conversion';

export default function ConversionListPage() {
  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [userId, setUserId] = useState('');
  const [debouncedUserId, setDebouncedUserId] = useState('');
  const [direction, setDirection] = useState('all');
  const [tierId, setTierId] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [debouncedIp, setDebouncedIp] = useState('');

  // Detail modal
  const [selectedConversion, setSelectedConversion] = useState<ConversionRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // User audit
  const [auditUserId, setAuditUserId] = useState<string | null>(null);

  // Debounced inputs
  const debouncedSetUserId = useMemo(
    () =>
      debounce((v: string) => {
        setDebouncedUserId(v);
        setPage(1);
      }, 300),
    [],
  );
  const debouncedSetIp = useMemo(
    () =>
      debounce((v: string) => {
        setDebouncedIp(v);
        setPage(1);
      }, 300),
    [],
  );

  const handleUserIdChange = useCallback(
    (v: string) => {
      setUserId(v);
      debouncedSetUserId(v);
    },
    [debouncedSetUserId],
  );
  const handleIpChange = useCallback(
    (v: string) => {
      setIpAddress(v);
      debouncedSetIp(v);
    },
    [debouncedSetIp],
  );

  const handleDirectionChange = useCallback((v: string) => {
    setDirection(v);
    setPage(1);
  }, []);
  const handleTierIdChange = useCallback((v: string) => {
    setTierId(v);
    setPage(1);
  }, []);
  const handleStatusChange = useCallback((v: string) => {
    setStatus(v);
    setPage(1);
  }, []);
  const handleDateFromChange = useCallback((v: string) => {
    setDateFrom(v);
    setPage(1);
  }, []);
  const handleDateToChange = useCallback((v: string) => {
    setDateTo(v);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setUserId('');
    setDebouncedUserId('');
    setDirection('all');
    setTierId('all');
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    setIpAddress('');
    setDebouncedIp('');
    setPage(1);
  }, []);

  // Fetch
  const { data: listResponse, isLoading } = useConversionList({
    page,
    limit,
    userId: debouncedUserId || undefined,
    direction: direction !== 'all' ? direction : undefined,
    tierId: tierId !== 'all' ? Number(tierId) : undefined,
    status: status !== 'all' ? status : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    ipAddress: debouncedIp || undefined,
  });

  const conversions = listResponse?.data?.conversions || [];
  const pagination = listResponse?.data?.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  };

  const handleViewDetail = useCallback((c: ConversionRecord) => {
    setSelectedConversion(c);
    setDetailOpen(true);
  }, []);

  const handleIpClick = useCallback((ip: string) => {
    setIpAddress(ip);
    setDebouncedIp(ip);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Giao Dich Doi Diem</h1>
        <p className="text-gray-500">Danh sách tất cả giao dịch đổi điểm Seed/OGN</p>
      </div>

      <ConversionListFilters
        userId={userId}
        direction={direction}
        tierId={tierId}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        ipAddress={ipAddress}
        onUserIdChange={handleUserIdChange}
        onDirectionChange={handleDirectionChange}
        onTierIdChange={handleTierIdChange}
        onStatusChange={handleStatusChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onIpAddressChange={handleIpChange}
        onReset={handleReset}
      />

      <ConversionListTable
        conversions={conversions}
        isLoading={isLoading}
        onViewDetail={handleViewDetail}
        onUserClick={setAuditUserId}
        onIpClick={handleIpClick}
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

      <ConversionDetailModal
        conversion={selectedConversion}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedConversion(null);
        }}
      />

      <UserAuditDialog
        userId={auditUserId}
        open={!!auditUserId}
        onClose={() => setAuditUserId(null)}
      />
    </div>
  );
}
