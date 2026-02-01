

import { FileCode, HardDrive, Hash, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface FileStats {
  size: number;
  sizeFormatted: string;
  lines: number;
  modifiedAt: string;
  createdAt: string;
  extension: string;
  language: string;
  isLarge: boolean;
  isHeavy: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  path: string;
}

interface FileInfoPanelProps {
  stats: FileStats | null;
  loading?: boolean;
}

export function FileInfoPanel({ stats, loading }: FileInfoPanelProps) {
  if (loading) {
    return (
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-800">
        <div className="animate-pulse flex gap-6">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-700 rounded w-28"></div>
          <div className="h-4 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const riskConfig = {
    low: {
      color: 'text-green-400',
      bg: 'bg-green-900/30',
      icon: CheckCircle,
      label: 'Tot',
    },
    medium: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/30',
      icon: AlertTriangle,
      label: 'Can xem xet',
    },
    high: {
      color: 'text-red-400',
      bg: 'bg-red-900/30',
      icon: AlertTriangle,
      label: 'Can toi uu',
    },
  };

  const risk = riskConfig[stats.riskLevel];
  const RiskIcon = risk.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {/* Language */}
        <div className="flex items-center gap-2">
          <FileCode size={15} className="text-blue-400" />
          <span className="text-gray-300 font-medium">{stats.language}</span>
        </div>

        {/* Lines */}
        <div className="flex items-center gap-2">
          <Hash size={15} className="text-purple-400" />
          <span className="text-gray-400">
            <span className="font-medium text-gray-300">
              {stats.lines.toLocaleString()}
            </span>
            {' '}dong
            {stats.isLarge && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-yellow-900/50 text-yellow-400">
                nhieu
              </span>
            )}
          </span>
        </div>

        {/* Size */}
        <div className="flex items-center gap-2">
          <HardDrive size={15} className="text-green-400" />
          <span className="text-gray-400">
            <span className="font-medium text-gray-300">{stats.sizeFormatted}</span>
            {stats.isHeavy && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-orange-900/50 text-orange-400">
                nang
              </span>
            )}
          </span>
        </div>

        {/* Modified Date */}
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-orange-400" />
          <span className="text-gray-400">
            Sua: <span className="font-medium text-gray-300">{formatDate(stats.modifiedAt)}</span>
          </span>
        </div>

        {/* Risk Level */}
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${risk.bg}`}>
          <RiskIcon size={14} className={risk.color} />
          <span className={`font-medium ${risk.color}`}>{risk.label}</span>
        </div>
      </div>
    </div>
  );
}
