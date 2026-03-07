import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Table2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  FileJson,
  FileSpreadsheet,
  Columns,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTableData } from '@/hooks/useMonitoring';

// Column co the la string hoac object voi column_name
interface ColumnInfo {
  column_name: string;
  data_type?: string;
  is_nullable?: string;
  character_maximum_length?: number | null;
  column_default?: string | null;
}

// Helper de lay ten column tu string hoac object
function getColumnName(col: string | ColumnInfo): string {
  if (typeof col === 'string') {
    return col;
  }
  return col.column_name || 'unknown';
}

// Helper de lay thong tin column
function getColumnInfo(col: string | ColumnInfo): ColumnInfo {
  if (typeof col === 'string') {
    return { column_name: col };
  }
  return col;
}

// Helper de format data type cho hien thi
function formatDataType(col: ColumnInfo): string {
  let type = col.data_type || 'unknown';
  if (col.character_maximum_length) {
    type += `(${col.character_maximum_length})`;
  }
  return type;
}

function TableDetailContent({ tableName }: { tableName: string }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSchema, setShowSchema] = useState(false);
  const limit = 20;

  const { data, isLoading, isError, refetch, isFetching } = useTableData(tableName, {
    page,
    limit,
  });

  // Filter rows based on search query
  const rawRows = data?.rows;
  const filteredRows = useMemo(() => {
    if (!rawRows || !searchQuery.trim()) {
      return rawRows || [];
    }
    const query = searchQuery.toLowerCase();
    return rawRows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [rawRows, searchQuery]);

  // Export functions
  const exportToCSV = () => {
    if (!data?.rows || !data?.columns) return;

    const columns = data.columns.map((col) => getColumnName(col));
    const exportRows = searchQuery ? filteredRows : data.rows;

    // Create CSV content
    const csvHeader = columns.join(',');
    const csvRows = exportRows.map((row) =>
      columns
        .map((col) => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          // Escape quotes and wrap in quotes if contains comma or newline
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(','),
    );

    const csvContent = [csvHeader, ...csvRows].join('\n');
    downloadFile(csvContent, `${tableName}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    if (!data?.rows) return;

    const jsonRows = searchQuery ? filteredRows : data.rows;
    const jsonContent = JSON.stringify(jsonRows, null, 2);
    downloadFile(jsonContent, `${tableName}.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!tableName) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chua chon table</h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Vui long chon mot table tu danh sach database
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Table2 className="h-6 w-6" />
            {tableName}
          </h1>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-red-500 text-lg">Khong the tai du lieu tu bang {tableName}</p>
              <Button onClick={() => refetch()}>Thu lai</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil((data.total || 0) / limit);
  const rawColumns = data.columns || [];
  const rows = searchQuery ? filteredRows : data.rows || [];

  // Normalize columns - co the la array of strings hoac array of objects
  const columns: string[] = rawColumns.map((col: string | ColumnInfo) => getColumnName(col));
  const columnInfos: ColumnInfo[] = rawColumns.map((col: string | ColumnInfo) =>
    getColumnInfo(col),
  );

  // Check if we have schema info (columns are objects with metadata)
  const hasSchemaInfo = rawColumns.length > 0 && typeof rawColumns[0] !== 'string';

  // Format cell value for display
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    const strValue = String(value);
    // Truncate long values
    if (strValue.length > 100) {
      return strValue.substring(0, 100) + '...';
    }
    return strValue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Table2 className="h-6 w-6 text-blue-600" />
            {tableName}
          </h1>
          <span className="text-muted-foreground">({data.total?.toLocaleString() || 0} rows)</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Column Schema Panel */}
      {hasSchemaInfo && (
        <Collapsible open={showSchema} onOpenChange={setShowSchema}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Columns className="h-5 w-5" />
                    Column Schema ({columnInfos.length} columns)
                  </div>
                  {showSchema ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Column Name</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Nullable</TableHead>
                        <TableHead>Default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {columnInfos.map((col, index) => (
                        <TableRow key={col.column_name}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-mono font-medium">{col.column_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">
                              {formatDataType(col)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {col.is_nullable === 'YES' ? (
                              <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-600"
                              >
                                NULL
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                NOT NULL
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {col.column_default || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data</span>
            <span className="text-sm font-normal text-muted-foreground">
              Trang {page} / {totalPages || 1}
            </span>
          </CardTitle>
          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm trong trang hiện tại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {filteredRows.length} ket qua
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {columns.map((col) => (
                      <TableHead key={col} className="min-w-[120px]">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground">
                        {searchQuery ? index + 1 : (page - 1) * limit + index + 1}
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col} className="font-mono text-sm max-w-[300px] truncate">
                          {formatCellValue(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu trong bảng này'}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !searchQuery && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, data.total || 0)} trong{' '}
                {data.total?.toLocaleString() || 0} rows
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <span className="text-sm px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TableDetailPage() {
  const [searchParams] = useSearchParams();
  const tableName = searchParams.get('name') || '';

  // Use key prop to reset component state when tableName changes
  return <TableDetailContent key={tableName} tableName={tableName} />;
}
