import { useState, useCallback, useMemo } from 'react';
import {
  FailedAttemptsTable,
  FailedAttemptsFilters,
  UserAuditDialog,
} from '@/components/conversion';
import { Pagination } from '@/components/users/Pagination';
import { useFailedAttempts } from '@/hooks/useConversion';
import { debounce } from '@/lib/utils';

export default function ConversionFailedPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [userId, setUserId] = useState('');
  const [debouncedUserId, setDebouncedUserId] = useState('');
  const [failReason, setFailReason] = useState('all');
  const [ipAddress, setIpAddress] = useState('');
  const [debouncedIp, setDebouncedIp] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [auditUserId, setAuditUserId] = useState<string | null>(null);

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
  const handleFailReasonChange = useCallback((v: string) => {
    setFailReason(v);
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
    setFailReason('all');
    setIpAddress('');
    setDebouncedIp('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const handleIpClick = useCallback((ip: string) => {
    setIpAddress(ip);
    setDebouncedIp(ip);
    setPage(1);
  }, []);

  const { data: response, isLoading } = useFailedAttempts({
    page,
    limit,
    userId: debouncedUserId || undefined,
    failReason: failReason !== 'all' ? failReason : undefined,
    ipAddress: debouncedIp || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const attempts = response?.data?.attempts || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Failed Attempts</h1>
        <p className="text-gray-500">Lich su cac lan doi diem that bai</p>
      </div>

      <FailedAttemptsFilters
        userId={userId}
        failReason={failReason}
        ipAddress={ipAddress}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onUserIdChange={handleUserIdChange}
        onFailReasonChange={handleFailReasonChange}
        onIpAddressChange={handleIpChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onReset={handleReset}
      />

      <FailedAttemptsTable
        attempts={attempts}
        isLoading={isLoading}
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

      <UserAuditDialog
        userId={auditUserId}
        open={!!auditUserId}
        onClose={() => setAuditUserId(null)}
      />
    </div>
  );
}
