import { useState } from 'react';
import { AdminLogsTable } from '@/components/conversion';
import { Pagination } from '@/components/users/Pagination';
import { useConversionAdminLogs } from '@/hooks/useConversion';

export default function ConversionAdminLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const { data: response, isLoading } = useConversionAdminLogs(page, limit);

  const logs = response?.data?.logs || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Logs — Doi Diem</h1>
        <p className="text-gray-500">Lich su hanh dong cua admin trong module doi diem</p>
      </div>

      <AdminLogsTable logs={logs} isLoading={isLoading} />

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
    </div>
  );
}
