

import { useEffect } from 'react';
import { Database, ArrowLeft, Table2, HardDrive, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDatabaseStats, formatBytes } from '@/hooks/useMonitoring';

// Helper function để lấy tên table từ nhiều field khác nhau
function getTableName(table: Record<string, unknown>): string {
  return (table.tablename || table.table_name || table.name || 'Unknown') as string;
}

// Helper function để lấy schema
function getSchemaName(table: Record<string, unknown>): string {
  return (table.schemaname || table.schema_name || table.schema || 'public') as string;
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

export default function DatabasePage() {
  const navigate = useNavigate();
  const { data: database, isLoading, isError, refetch } = useDatabaseStats();

  // Log database data khi có
  useEffect(() => {
    if (database) {
      console.log('[DEBUG] DatabasePage - database:', database);
      console.log('[DEBUG] DatabasePage - tables:', database.tables);
      if (database.tables && database.tables.length > 0) {
        console.log('[DEBUG] DatabasePage - first table keys:', Object.keys(database.tables[0]));
        console.log('[DEBUG] DatabasePage - first table:', database.tables[0]);
      }
    }
  }, [database]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !database) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database
          </h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-red-500 text-lg">Không thể tải thông tin database</p>
              <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeConnectionsPercent = database.connections.total > 0
    ? (database.connections.active / database.connections.total) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          PostgreSQL Database
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Size */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Dung lượng Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatBytes(database.size)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Tổng dung lượng lưu trữ của cơ sở dữ liệu PostgreSQL
            </p>
          </CardContent>
        </Card>

        {/* Active Connections */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kết nối đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{database.connections.active}</p>
            <div className="mt-2">
              <Progress value={activeConnectionsPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {database.connections.active} / {database.connections.total} kết nối
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Số kết nối đang xử lý truy vấn hoặc giao dịch
            </p>
          </CardContent>
        </Card>

        {/* Idle Connections */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kết nối chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{database.connections.idle}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Tổng: {database.connections.total} kết nối
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Kết nối đang mở nhưng không xử lý truy vấn nào
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            Tất cả bảng ({database.tables?.length || 0})
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách các bảng trong cơ sở dữ liệu. Click vào tên bảng để xem chi tiết dữ liệu.
          </p>
        </CardHeader>
        <CardContent>
          {database.tables && database.tables.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead>Tên bảng</TableHead>
                  <TableHead className="text-right">Số dòng</TableHead>
                  <TableHead className="text-right">Dung lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {database.tables.map((table, index) => {
                  const tableRecord = table as unknown as Record<string, unknown>;
                  const tableName = getTableName(tableRecord);
                  const schemaName = getSchemaName(tableRecord);
                  const rowCount = getRowCount(tableRecord);
                  const tableSize = getTableSize(tableRecord);

                  return (
                    <TableRow
                      key={`${schemaName}.${tableName}-${index}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/dashboard/database/table?name=${encodeURIComponent(tableName)}`)}
                    >
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{schemaName}</TableCell>
                      <TableCell className="font-medium text-blue-600 hover:underline">{tableName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {rowCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {tableSize > 0 ? formatBytes(tableSize) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có thông tin tables
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
