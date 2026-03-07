import { useState } from 'react';
import {
  Wallet,
  RefreshCw,
  ExternalLink,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Users,
  Shield,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  useWallets,
  useWalletTransactions,
  useBalanceHistory,
  useCheckWallets,
} from '@/hooks/useWalletMonitor';
import type { SystemWallet, WalletTransaction, WalletsResponse } from '@/lib/api';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'vua xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phut truoc';
  if (diff < 86400) return Math.floor(diff / 3600) + ' gio truoc';
  return Math.floor(diff / 86400) + ' ngay truoc';
}

function truncateAddress(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function copyAddress(addr: string) {
  navigator.clipboard.writeText(addr);
  toast.success('Da copy dia chi!');
}

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-600',
  low: 'bg-yellow-600',
  ok: 'bg-green-600',
};

const STATUS_TEXT: Record<string, string> = {
  critical: 'CRITICAL',
  low: 'LOW',
  ok: 'OK',
};

function WalletCard({
  wallet,
  onViewTxs,
}: {
  wallet: SystemWallet;
  onViewTxs: (id: string) => void;
}) {
  const borderColor =
    wallet.status === 'critical'
      ? 'border-red-500'
      : wallet.status === 'low'
        ? 'border-yellow-500'
        : 'border-gray-700';

  return (
    <Card className={`bg-gray-800 ${borderColor}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-100 font-semibold">{wallet.name}</span>
          <Badge className={STATUS_COLORS[wallet.status]}>{STATUS_TEXT[wallet.status]}</Badge>
        </div>

        <button
          onClick={() => copyAddress(wallet.address)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {truncateAddress(wallet.address)}
          <Copy className="w-3 h-3" />
        </button>

        <div>
          <div className="text-xl font-bold text-gray-100">{wallet.balance} AVAX</div>
          <div className="text-sm text-gray-400">${wallet.balanceUsd.toFixed(2)}</div>
        </div>

        <div className="text-xs text-gray-500">{wallet.role}</div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewTxs(wallet.id)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 text-xs"
          >
            Xem Txs
          </Button>
          <a href={wallet.explorerUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 text-xs"
            >
              Snowscan <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>

        {wallet.lastChecked && (
          <div className="text-xs text-gray-600">Cap nhat: {timeAgo(wallet.lastChecked)}</div>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isIn = tx.type === 'in';
  return (
    <div className="py-2 flex items-center gap-3 flex-wrap text-sm">
      <a
        href={`https://snowscan.xyz/tx/${tx.hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
      >
        {truncateAddress(tx.hash)} <ExternalLink className="w-3 h-3" />
      </a>
      <Badge className={isIn ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}>
        {isIn ? (
          <ArrowDownLeft className="w-3 h-3 mr-1" />
        ) : (
          <ArrowUpRight className="w-3 h-3 mr-1" />
        )}
        {isIn ? 'IN' : 'OUT'}
      </Badge>
      <span className={isIn ? 'text-green-400' : 'text-red-400'}>
        {isIn ? '+' : '-'}
        {tx.value} AVAX
      </span>
      <span className="text-gray-400">{tx.method}</span>
      {tx.status === 'success' ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className="text-gray-500">{timeAgo(tx.timestamp)}</span>
    </div>
  );
}

export default function WalletMonitorPage() {
  const { data, isLoading, error } = useWallets();
  const checkWallets = useCheckWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [txPage, setTxPage] = useState(1);
  const [chartWalletId, setChartWalletId] = useState<string | undefined>(undefined);

  const walletsResponse = data?.data as WalletsResponse | undefined;
  const wallets: SystemWallet[] = walletsResponse?.wallets ?? [];
  const summary = walletsResponse?.summary;
  const userWallets = walletsResponse?.userWallets;

  const { data: txData, isLoading: txLoading } = useWalletTransactions(selectedWalletId, txPage);
  const txResponse = txData?.data as
    | { transactions: WalletTransaction[]; total: number; page: number; totalPages: number }
    | undefined;
  const transactions: WalletTransaction[] = txResponse?.transactions ?? [];
  const txTotalPages: number = txResponse?.totalPages ?? 1;

  const { data: historyData } = useBalanceHistory(chartWalletId ?? wallets[0]?.id, 7);
  const historyResponse = historyData?.data as
    | { logs: { checkedAt: string; balanceAvax: number }[] }
    | undefined;
  const balanceLogs = historyResponse?.logs ?? [];

  const chartData = balanceLogs.map((l) => ({
    time: new Date(l.checkedAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    avax: l.balanceAvax,
  }));

  const criticalWallets = wallets.filter((w) => w.status === 'critical');
  const lowWallets = wallets.filter((w) => w.status === 'low');
  const alertWallets = [...criticalWallets, ...lowWallets];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Wallet className="w-7 h-7 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-100">Wallet Monitor</h1>
        </div>
        <div className="flex items-center gap-3">
          {summary?.lastUpdated && (
            <span className="text-sm text-gray-500">
              Cap nhat: {timeAgo(summary.lastUpdated)} — Tu dong refresh moi 60s
            </span>
          )}
          <Button
            size="sm"
            onClick={() => checkWallets.mutate()}
            disabled={checkWallets.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${checkWallets.isPending ? 'animate-spin' : ''}`} />
            {checkWallets.isPending ? 'Dang cap nhat...' : 'Lam moi'}
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertWallets.length > 0 && (
        <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-4 space-y-1">
          {alertWallets.map((w) => (
            <div key={w.id} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${w.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}
              />
              <span className="text-gray-100 font-medium">{w.name}:</span>
              <span className="text-gray-300">
                {w.balance} AVAX (${w.balanceUsd.toFixed(2)})
              </span>
              <span className="text-gray-500">
                — {w.status === 'critical' ? 'Can nap gap!' : 'Balance thap'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Loading / Error */}
      {isLoading && <div className="text-gray-400">Dang tai...</div>}
      {error && <div className="text-red-400">Loi tai du lieu wallet</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{summary.criticalCount}</div>
              <div className="text-sm text-gray-400">Critical</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{summary.lowCount}</div>
              <div className="text-sm text-gray-400">Low</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {summary.totalWallets - summary.criticalCount - summary.lowCount}
              </div>
              <div className="text-sm text-gray-400">OK</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wallet Cards */}
      {wallets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              onViewTxs={(id) => {
                setSelectedWalletId(id);
                setTxPage(1);
              }}
            />
          ))}
        </div>
      )}

      {/* User Wallets */}
      {userWallets && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">User Wallets</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-lg font-bold text-gray-100">{userWallets.custodial}</div>
                  <div className="text-xs text-gray-400">Custodial</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-lg font-bold text-gray-100">{userWallets.smartWallet}</div>
                  <div className="text-xs text-gray-400">Smart Wallet</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-lg font-bold text-gray-100">{userWallets.externalSiwe}</div>
                  <div className="text-xs text-gray-400">External SIWE</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance History Chart */}
      {wallets.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-gray-100">Balance History (7 ngay)</h2>
              <select
                value={chartWalletId ?? wallets[0]?.id ?? ''}
                onChange={(e) => setChartWalletId(e.target.value)}
                className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-gray-100 text-sm focus:border-green-500 focus:outline-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                    formatter={(value: number) => [`${value.toFixed(4)} AVAX`, 'Balance']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avax"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">
                Chua co du lieu balance history
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-100">Lich su giao dich</h2>
            <select
              value={selectedWalletId ?? ''}
              onChange={(e) => {
                setSelectedWalletId(e.target.value || null);
                setTxPage(1);
              }}
              className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-gray-100 text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="">-- Chon vi --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {!selectedWalletId ? (
            <div className="text-gray-500 text-sm py-4">Chon mot vi de xem lich su giao dich</div>
          ) : txLoading ? (
            <div className="text-gray-400 py-4">Dang tai giao dich...</div>
          ) : transactions.length === 0 ? (
            <div className="text-gray-500 py-4">Khong co giao dich nao</div>
          ) : (
            <>
              <div className="divide-y divide-gray-700">
                {transactions.map((tx) => (
                  <TransactionRow key={tx.hash} tx={tx} />
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => p - 1)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Trang truoc
                </Button>
                <span className="text-sm text-gray-400">
                  Trang {txPage}/{txTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage >= txTotalPages}
                  onClick={() => setTxPage((p) => p + 1)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Trang sau
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
