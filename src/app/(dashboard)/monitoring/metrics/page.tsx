

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Database, Zap, AlertTriangle, ArrowLeft, Clock, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';
import {
  useSlowQueries,
  useFrequentQueries,
  useQueryRecommendations,
  useDatabaseStats,
} from '@/hooks/useMonitoring';

// Helper function to format query time
function formatQueryTime(ms: number): string {
  if (ms < 1) return '<1 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// Helper function to format bytes to MB
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${Math.round(mb)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

// Severity colors for recommendations
const severityColor: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300',
};

const QUERY_LIMIT_OPTIONS = [
  { value: '10', label: 'Top 10' },
  { value: '20', label: 'Top 20' },
  { value: '50', label: 'Top 50' },
];

export default function MetricsPage() {
  const navigate = useNavigate();
  const [queryLimit, setQueryLimit] = useState('20');

  // Use query-analytics endpoints that work correctly
  const { data: slowQueries = [], isLoading: slowLoading, refetch: refetchSlow } = useSlowQueries(parseInt(queryLimit));
  const { data: frequentQueries = [], isLoading: frequentLoading, refetch: refetchFrequent } = useFrequentQueries(parseInt(queryLimit));
  const { data: recommendations, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQueryRecommendations();
  const { data: dbStats, isLoading: dbLoading, refetch: refetchDb } = useDatabaseStats();

  const isLoading = slowLoading || frequentLoading || recommendationsLoading || dbLoading;

  // Calculate performance stats from query data
  const stats = useMemo(() => {
    const totalCalls = frequentQueries.reduce((sum, q) => sum + q.calls, 0);
    const totalTime = frequentQueries.reduce((sum, q) => sum + q.total_time_ms, 0);
    const avgTime = totalCalls > 0 ? totalTime / totalCalls : 0;

    return {
      connections: {
        active: dbStats?.connections?.active ?? 0,
        idle: dbStats?.connections?.idle ?? 0,
        total: dbStats?.connections?.total ?? 0,
      },
      database: {
        size: dbStats?.size ?? 0,
      },
      queries: {
        total: totalCalls,
        slow: slowQueries.length,
        avgTime: avgTime,
      },
    };
  }, [slowQueries, frequentQueries, dbStats]);

  // Prepare chart data for slow queries
  const slowQueryChartData = useMemo(() => {
    return slowQueries.slice(0, 10).map((q, idx) => ({
      name: `Q${idx + 1}`,
      avgTime: Math.round(q.avg_time_ms),
      calls: q.calls,
      query: q.query_text.substring(0, 50) + '...',
    }));
  }, [slowQueries]);

  const handleRefresh = () => {
    refetchSlow();
    refetchFrequent();
    refetchRecommendations();
    refetchDb();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Hiệu suất Database
            </h1>
            <p className="text-muted-foreground">
              Giám sát hiệu suất cơ sở dữ liệu theo thời gian thực
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Select value={queryLimit} onValueChange={setQueryLimit}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              {QUERY_LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kết nối hoạt động
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.connections.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.connections.idle} chờ - Tổng: {stats.connections.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Số kết nối đang xử lý truy vấn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dung lượng DB</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatBytes(stats.database.size)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng dung lượng lưu trữ database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian TB</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatQueryTime(stats.queries.avgTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.queries.total.toLocaleString()} truy vấn tổng
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Thời gian trung bình mỗi truy vấn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Truy vấn chậm</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.queries.slow}
            </div>
            <p className="text-xs text-muted-foreground">truy vấn cần tối ưu</p>
            <p className="text-xs text-muted-foreground mt-1">
              Truy vấn có thời gian thực thi cao
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.recommendations && recommendations.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Đề xuất tối ưu ({recommendations.count})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Các gợi ý để cải thiện hiệu suất database dựa trên phân tích truy vấn
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.recommendations.slice(0, 5).map((rec, idx) => (
              <Alert key={idx} className={`border ${severityColor[rec.severity] || 'border-gray-300'}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <strong>{rec.title}</strong>
                      <p className="text-sm mt-1">{rec.description}</p>
                      {rec.action && (
                        <p className="text-sm mt-2 font-medium">Hành động: {rec.action}</p>
                      )}
                    </div>
                    <Badge variant={rec.severity === 'critical' || rec.severity === 'high' ? 'destructive' : 'secondary'}>
                      {rec.severity === 'critical' ? 'NGHIÊM TRỌNG' : rec.severity === 'high' ? 'CAO' : rec.severity === 'medium' ? 'TRUNG BÌNH' : 'THẤP'}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Slow Queries Chart */}
      {slowQueryChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Biểu đồ truy vấn chậm - Thời gian TB (Top 10)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              So sánh thời gian thực thi trung bình của các truy vấn chậm nhất
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={slowQueryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit=" ms" />
                <YAxis dataKey="name" type="category" width={50} />
                <Tooltip
                  formatter={(value, name) => [formatQueryTime(value as number), name === 'avgTime' ? 'Avg Time' : 'Calls']}
                  labelFormatter={(label) => {
                    const item = slowQueryChartData.find(d => d.name === label);
                    return item ? item.query : label;
                  }}
                />
                <Bar dataKey="avgTime" fill="#f97316" name="Average Time" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slow Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Truy vấn chậm ({slowQueries.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Các truy vấn có thời gian thực thi cao, cần được tối ưu
            </p>
          </CardHeader>
          <CardContent>
            {slowQueries.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {slowQueries.slice(0, 10).map((query, idx) => (
                  <div key={query.queryid} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">#{idx + 1}</Badge>
                        <span className="text-sm font-semibold text-orange-600">
                          {formatQueryTime(query.avg_time_ms)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {query.calls} lần gọi
                      </span>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                      {query.query_text.substring(0, 200)}{query.query_text.length > 200 ? '...' : ''}
                    </pre>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                      <span>Tối đa: {formatQueryTime(query.max_time_ms)}</span>
                      <span>Tổng: {formatQueryTime(query.total_time_ms)}</span>
                      <span>{query.pct_total_time}% tổng thời gian</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Không phát hiện truy vấn chậm</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frequent Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Truy vấn thường xuyên ({frequentQueries.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Các truy vấn được gọi nhiều nhất, ảnh hưởng lớn đến hiệu suất
            </p>
          </CardHeader>
          <CardContent>
            {frequentQueries.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {frequentQueries.slice(0, 10).map((query, idx) => (
                  <div key={query.queryid} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge>#{idx + 1}</Badge>
                        <span className="text-sm font-semibold text-blue-600">
                          {query.calls.toLocaleString()} lần gọi
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        TB: {formatQueryTime(query.avg_time_ms)}
                      </span>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                      {query.query_text.substring(0, 200)}{query.query_text.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Không có dữ liệu truy vấn</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
