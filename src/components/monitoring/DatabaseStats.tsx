

import { Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDatabaseStats, formatBytes } from '@/hooks/useMonitoring';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function để lấy tên table từ nhiều field khác nhau
function getTableName(table: Record<string, unknown>): string {
  return (table.tablename || table.table_name || table.name || 'Unknown') as string;
}

// Helper function để lấy row count
function getRowCount(table: Record<string, unknown>): number {
  const count = table.row_count ?? table.rowCount ?? table.rows ?? table.n_live_tup ?? 0;
  return Number(count) || 0;
}

// Helper function để lấy size
function getTableSize(table: Record<string, unknown>): number {
  const size = table.total_size ?? table.totalSize ?? table.size ?? table.table_size ?? 0;
  return Number(size) || 0;
}

export function DatabaseStatsCard() {
  const navigate = useNavigate();
  const { data: database, isLoading, isError } = useDatabaseStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !database) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Khong the tai thong tin database
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeConnectionsPercent = database.connections.total > 0
    ? (database.connections.active / database.connections.total) * 100
    : 0;

  const handleClick = () => {
    navigate('/dashboard/database');
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          PostgreSQL Database
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Size */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Database Size</span>
            <span className="font-medium">{formatBytes(database.size)}</span>
          </div>
        </div>

        {/* Connections */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Connections</span>
            <span className="font-medium">
              {database.connections.active} / {database.connections.total}
            </span>
          </div>
          <Progress value={activeConnectionsPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Active: {database.connections.active}</span>
            <span>Idle: {database.connections.idle}</span>
          </div>
        </div>

        {/* Top Tables */}
        {database.tables && database.tables.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Top Tables</p>
            <div className="space-y-1">
              {database.tables.slice(0, 5).map((table, index) => {
                const tableRecord = table as unknown as Record<string, unknown>;
                const tableName = getTableName(tableRecord);
                const rowCount = getRowCount(tableRecord);
                const tableSize = getTableSize(tableRecord);

                return (
                  <div key={`${tableName}-${index}`} className="flex justify-between text-xs">
                    <span className="text-gray-600">{tableName}</span>
                    <span className="text-gray-500">
                      {rowCount.toLocaleString()} rows | {tableSize > 0 ? formatBytes(tableSize) : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
