import { useState } from 'react';
import {
  Wallet,
  Copy,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { HotWalletInfo } from '@/types/topup';

interface Props {
  data: HotWalletInfo | undefined;
  isLoading: boolean;
}

const SNOWTRACE_BASE = 'https://snowtrace.io';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function HotWalletCard({ data, isLoading }: Props) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.address);
    setCopied(true);
    toast.success('Da copy dia chi vi');
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    ok: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: '',
    },
    warning: {
      border: 'border-yellow-300',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: `So du thap! Nap them AVAX de dam bao hoat dong. Nguong canh bao: < ${data.thresholds.warning} AVAX`,
    },
    critical: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: `So du qua thap! He thong co the ngung chuyen AVAX. Nguong nguy hiem: < ${data.thresholds.critical} AVAX`,
    },
  };

  const cfg = statusConfig[data.balanceStatus];

  return (
    <div className={`rounded-lg border ${cfg.border} bg-white p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-orange-50 p-2">
            <Wallet className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg">Hot Wallet</h3>
        </div>
        <div className="text-xs text-gray-400">Auto-refresh 60s</div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 mb-5">
        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {truncateAddress(data.address)}
        </code>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : ''}
        </Button>
        <a
          href={`${SNOWTRACE_BASE}/address/${data.address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <span className="text-xs">Snowtrace</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Button>
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
        {/* Balance */}
        <div className={`rounded-lg p-4 ${cfg.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className={`h-4 w-4 ${cfg.text}`} />
            <span className="text-sm text-gray-500">So du hien tai</span>
          </div>
          <p className={`text-2xl font-bold ${cfg.text}`}>{data.balanceAvax} AVAX</p>
          <p className="text-sm text-gray-500">≈ ${data.balanceUsd.toFixed(2)}</p>
        </div>

        {/* Transferred */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-500">Da chuyen</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {data.totalTransferredAvax.toFixed(2)} AVAX
          </p>
          <p className="text-sm text-gray-500">{data.totalCompletedTx} giao dich</p>
        </div>

        {/* Failed */}
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-gray-500">That bai</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{data.totalFailedTx}</p>
          <p className="text-sm text-gray-500">giao dich</p>
        </div>
      </div>

      {/* Warning Banner */}
      {data.balanceStatus !== 'ok' && (
        <div className={`flex items-start gap-2 rounded-lg ${cfg.bg} p-3`}>
          <AlertTriangle className={`h-4 w-4 mt-0.5 ${cfg.text} shrink-0`} />
          <div>
            <p className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</p>
            <button
              onClick={handleCopy}
              className={`text-xs underline mt-1 ${cfg.text} hover:opacity-80`}
            >
              Copy dia chi de nap them
            </button>
          </div>
        </div>
      )}

      {/* AVAX Price */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <RefreshCw className="h-3 w-3" />
        <span>Gia AVAX: ${data.avaxPriceUsd.toFixed(2)}</span>
      </div>
    </div>
  );
}
