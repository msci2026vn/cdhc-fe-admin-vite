

import { useState, useEffect } from 'react';
import {
  Activity,
  FileWarning,
  HardDrive,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  FileCode,
  BarChart3,
} from 'lucide-react';
import { adminV2Api, type CodeHealthData } from '@/lib/api';

interface CodeHealthReportProps {
  onSelectFile: (path: string) => void;
}

export function CodeHealthReport({ onSelectFile }: CodeHealthReportProps) {
  const [data, setData] = useState<CodeHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminV2Api.files.getHealthReport();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load health report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBadge = (risk: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-green-900/50', text: 'text-green-400', label: 'Thap' },
      medium: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'TB' },
      high: { bg: 'bg-red-900/50', text: 'text-red-400', label: 'Cao' },
    };
    const c = config[risk] || config.low;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  if (loading && !data) {
    return (
      <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent" />
          <span className="text-sm text-gray-400">Dang phan tich codebase...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 rounded-xl border border-red-800">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={loadReport}
          className="mt-2 text-sm text-red-400 hover:underline flex items-center gap-1"
        >
          <RefreshCw size={14} /> Thu lai
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header - Collapsible */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-850 cursor-pointer hover:from-gray-750 hover:to-gray-800 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Activity className="text-white" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Bao cao suc khoe Code</h3>
            <p className="text-xs text-gray-500">
              {data.totalFiles} files - {data.totalLines.toLocaleString()} dong - {data.totalSizeFormatted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Health Score Circle */}
          <div className="relative">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-700"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${(data.summary.healthScore / 100) * 150.8} 150.8`}
                className={getScoreColor(data.summary.healthScore)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-bold ${getScoreColor(data.summary.healthScore)}`}>
                {data.summary.healthScore}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              loadReport();
            }}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Lam moi"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-green-400' : 'text-gray-500'} />
          </button>

          {expanded ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-1 p-3 bg-gray-800/50 border-b border-gray-700">
        <div className="text-center px-2 py-2 bg-gray-800 rounded-lg">
          <div className="text-lg font-bold text-gray-200">
            {data.summary.avgLinesPerFile}
          </div>
          <div className="text-xs text-gray-500">TB dong/file</div>
        </div>
        <div className="text-center px-2 py-2 bg-gray-800 rounded-lg">
          <div className="text-lg font-bold text-yellow-400">{data.summary.filesOver400Lines}</div>
          <div className="text-xs text-gray-500">&gt;400 dong</div>
        </div>
        <div className="text-center px-2 py-2 bg-gray-800 rounded-lg">
          <div className="text-lg font-bold text-orange-400">{data.summary.filesOver50KB}</div>
          <div className="text-xs text-gray-500">&gt;50KB</div>
        </div>
        <div className="text-center px-2 py-2 bg-gray-800 rounded-lg">
          <div className={`text-lg font-bold ${getScoreColor(data.summary.healthScore)}`}>
            {data.summary.healthLabel}
          </div>
          <div className="text-xs text-gray-500">Danh gia</div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="divide-y divide-gray-800">
          {/* Large Files Table */}
          {data.largeFiles.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileWarning size={16} className="text-yellow-400" />
                <h4 className="font-semibold text-gray-300">
                  Files nhieu dong code ({data.largeFiles.length})
                </h4>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-left text-gray-400">
                      <th className="px-3 py-2.5 font-medium">File</th>
                      <th className="px-3 py-2.5 font-medium text-right">Dong</th>
                      <th className="px-3 py-2.5 font-medium text-right">Kich thuoc</th>
                      <th className="px-3 py-2.5 font-medium text-center">Rui ro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.largeFiles.map((file) => (
                      <tr
                        key={file.path}
                        className="hover:bg-green-900/20 cursor-pointer transition-colors"
                        onClick={() => onSelectFile(file.path)}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <FileCode size={14} className="text-gray-500 flex-shrink-0" />
                            <span className="text-green-400 hover:underline truncate max-w-[250px]">
                              {file.path}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-gray-300">
                          {file.lines.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-500">
                          {file.sizeFormatted}
                        </td>
                        <td className="px-3 py-2.5 text-center">{getRiskBadge(file.riskLevel)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Heavy Files Table */}
          {data.heavyFiles.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive size={16} className="text-orange-400" />
                <h4 className="font-semibold text-gray-300">
                  Files dung luong lon ({data.heavyFiles.length})
                </h4>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-left text-gray-400">
                      <th className="px-3 py-2.5 font-medium">File</th>
                      <th className="px-3 py-2.5 font-medium text-right">Kich thuoc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.heavyFiles.map((file) => (
                      <tr
                        key={file.path}
                        className="hover:bg-green-900/20 cursor-pointer transition-colors"
                        onClick={() => onSelectFile(file.path)}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <HardDrive size={14} className="text-gray-500 flex-shrink-0" />
                            <span className="text-green-400 hover:underline truncate max-w-[300px]">
                              {file.path}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-orange-400 font-medium">
                          {file.sizeFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* File Types Summary */}
          {Object.keys(data.filesByExtension).length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-blue-400" />
                <h4 className="font-semibold text-gray-300">Phan bo theo loai file</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(data.filesByExtension).map(([ext, info]) => (
                  <div
                    key={ext}
                    className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="font-mono text-sm font-medium text-gray-300">
                      {ext}
                    </div>
                    <div className="text-xs text-gray-500">
                      {info.count} files - {info.totalLines.toLocaleString()} dong
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Good Message */}
          {data.largeFiles.length === 0 && data.heavyFiles.length === 0 && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-4">
                <TrendingUp size={32} className="text-green-400" />
              </div>
              <p className="text-green-400 font-semibold text-lg">
                Code dang duoc to chuc tot!
              </p>
              <p className="text-sm text-gray-500 mt-1">Khong co file nao can toi uu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
