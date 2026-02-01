

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useSlowQueries,
  useFrequentQueries,
  useQueryRecommendations,
  useExplainQuery,
} from '@/hooks/useMonitoring';

const severityColor: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function QueryAnalyticsPage() {
  const navigate = useNavigate();
  const [explainQuery, setExplainQuery] = useState('');
  const [explainResult, setExplainResult] = useState<Record<string, unknown> | null>(null);

  const { data: slowQueries, isLoading: slowLoading } = useSlowQueries();
  const { data: frequentQueries, isLoading: frequentLoading } = useFrequentQueries();
  const { data: recommendations, isLoading: recommendationsLoading } = useQueryRecommendations();
  const explainMutation = useExplainQuery();

  const handleExplain = async () => {
    if (!explainQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      const result = await explainMutation.mutateAsync(explainQuery);
      setExplainResult(result);
      toast.success('Query plan generated');
    } catch {
      toast.error('Failed to explain query');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-purple-600" />
            Query Analytics
          </h1>
          <p className="text-muted-foreground">
            Analyze and optimize database query performance
          </p>
        </div>
      </div>

      <Tabs defaultValue="slow">
        <TabsList>
          <TabsTrigger value="slow">
            <Clock className="w-4 h-4 mr-2" />
            Slow Queries
          </TabsTrigger>
          <TabsTrigger value="frequent">
            <TrendingUp className="w-4 h-4 mr-2" />
            Most Frequent
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="w-4 h-4 mr-2" />
            Recommendations ({recommendations?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="explain">EXPLAIN Query</TabsTrigger>
        </TabsList>

        {/* Slow Queries Tab */}
        <TabsContent value="slow">
          <Card>
            <CardHeader>
              <CardTitle>Slowest Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {slowLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : !slowQueries || slowQueries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No slow queries detected
                </div>
              ) : (
                <div className="space-y-3">
                  {slowQueries.map((query, index) => (
                    <div
                      key={query.queryid}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">#{index + 1}</Badge>
                            <span className="text-sm font-semibold">
                              Avg: {query.avg_time_ms} ms
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Max: {query.max_time_ms} ms
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Calls: {query.calls}
                            </span>
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {query.query_text}
                          </pre>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="w-3 h-3" />
                        <span>
                          Accounts for {query.pct_total_time}% of total query
                          time
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frequent Queries Tab */}
        <TabsContent value="frequent">
          <Card>
            <CardHeader>
              <CardTitle>Most Frequently Executed Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {frequentLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : !frequentQueries || frequentQueries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No query statistics available
                </div>
              ) : (
                <div className="space-y-3">
                  {frequentQueries.map((query, index) => (
                    <div
                      key={query.queryid}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>#{index + 1}</Badge>
                        <span className="text-sm font-semibold">
                          {query.calls.toLocaleString()} calls
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Avg: {query.avg_time_ms} ms
                        </span>
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {query.query_text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : !recommendations?.recommendations ||
                recommendations.recommendations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">All systems optimized!</p>
                  <p className="text-sm">
                    No optimization recommendations at this time
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 border-l-4 ${severityColor[rec.severity]} rounded-lg`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            rec.severity === 'high'
                              ? 'destructive'
                              : rec.severity === 'medium'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {rec.severity.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm font-medium mb-2">
                          Recommended Action:
                        </p>
                        <p className="text-sm">{rec.action}</p>
                      </div>

                      {rec.details && rec.details.length > 0 && (
                        <details className="mt-3">
                          <summary className="text-sm font-medium cursor-pointer">
                            View Details ({rec.details.length} items)
                          </summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(rec.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPLAIN Tab */}
        <TabsContent value="explain">
          <Card>
            <CardHeader>
              <CardTitle>Query Execution Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Enter SELECT query to analyze:
                </label>
                <Textarea
                  placeholder="SELECT * FROM users WHERE email = 'test@example.com'"
                  value={explainQuery}
                  onChange={(e) => setExplainQuery(e.target.value)}
                  className="font-mono text-sm h-32"
                />
              </div>

              <Button
                onClick={handleExplain}
                disabled={explainMutation.isPending}
              >
                {explainMutation.isPending
                  ? 'Running...'
                  : 'Run EXPLAIN ANALYZE'}
              </Button>

              {explainResult && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Execution Plan:</h3>
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto max-h-96">
                    {JSON.stringify(explainResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
