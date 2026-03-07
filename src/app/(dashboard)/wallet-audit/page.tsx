import { useState } from 'react';
import { RefreshCw, ExternalLink, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useWalletAuditSummary, useWalletAuditDetail } from '@/hooks/useWalletAudit';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { WalletAuditSummaryResponse } from '@/lib/api';

// Wallet descriptions - plain language for non-technical admins
const WALLET_DESCRIPTIONS: Record<
  string,
  {
    icon: string;
    title: string;
    simple: string;
    explain: string;
    whenEmpty: string;
    topupGuide: string;
    type: 'operational' | 'collector' | 'contract';
  }
> = {
  deployer: {
    icon: '\u{1F4B3}',
    title: 'Deployer / Minter',
    simple: 'Vi chinh cua he thong',
    explain:
      'Dung de tao NFT moi cho nguoi choi khi ho thang World Boss, va thuc hien cac giao dich quan trong khac.',
    whenEmpty: 'Neu vi nay het tien: NFT se KHONG the duoc tao moi sau khi danh boss.',
    topupGuide: 'Nap toi thieu 0.5 AVAX. Khuyen nghi giu 1-2 AVAX.',
    type: 'operational',
  },
  marketplace_relayer: {
    icon: '\u26A1',
    title: 'Marketplace Relayer',
    simple: 'Vi trung gian mua ban NFT',
    explain:
      'Tu dong thuc hien giao dich mua/ban NFT giua nguoi choi va tra phi mang thay cho nguoi ban.',
    whenEmpty: 'Neu vi nay het tien: Nguoi choi KHONG the mua ban NFT tren Cho.',
    topupGuide: 'Nap toi thieu 0.5 AVAX. Khuyen nghi giu 1-2 AVAX.',
    type: 'operational',
  },
  fee_collector: {
    icon: '\u{1F3E6}',
    title: 'Fee Collector',
    simple: 'Ket thu tien phi giao dich',
    explain:
      'Tu dong nhan 5% phi moi khi co giao dich NFT (3% neu nguoi ban la VIP). Vi nay chi nhan tien, khong bao gio chi tieu.',
    whenEmpty: 'Vi nay khong can nap tien. So du se tu dong tang theo giao dich.',
    topupGuide: 'Khong can nap. De rut tien: dung MetaMask voi private key duoc luu an toan.',
    type: 'collector',
  },
  vip_receiver: {
    icon: '\u{1F451}',
    title: 'VIP Receiver',
    simple: 'Ket thu tien VIP',
    explain:
      'Nhan tien dang ky goi VIP va Auto-play tu nguoi choi. Vi nay chi nhan tien, khong bao gio chi tieu.',
    whenEmpty: 'Vi nay khong can nap tien.',
    topupGuide: 'Khong can nap. De rut tien: dung MetaMask voi private key duoc luu an toan.',
    type: 'collector',
  },
  nft_contract: {
    icon: '\u{1F4DC}',
    title: 'NFT Contract',
    simple: 'Smart contract ERC-721',
    explain: 'Hop dong thong minh quan ly tat ca NFT cards trong he thong.',
    whenEmpty: 'Day la smart contract, khong can nap tien.',
    topupGuide: 'Khong can nap.',
    type: 'contract',
  },
  merkle_contract: {
    icon: '\u{1F331}',
    title: 'Merkle / RWA Contract',
    simple: 'Smart contract IoT data',
    explain: 'Luu tru du lieu cam bien (IoT) len blockchain de xac thuc.',
    whenEmpty: 'Day la smart contract, khong can nap tien.',
    topupGuide: 'Khong can nap.',
    type: 'contract',
  },
};

function getWalletMeta(id: string) {
  return (
    WALLET_DESCRIPTIONS[id] ?? {
      icon: '\u{1F4B0}',
      title: id,
      simple: '',
      explain: '',
      whenEmpty: '',
      topupGuide: '',
      type: 'operational' as const,
    }
  );
}

const statusColors = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ok: 'bg-green-100 text-green-800 border-green-300',
};

const statusLabels = {
  critical: 'CRITICAL',
  low: 'LOW',
  ok: 'OK',
};

function copyAddress(addr: string) {
  navigator.clipboard.writeText(addr);
  toast.success('Da copy dia chi');
}

function shortenAddress(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatAvax(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '0';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0';
  return n.toFixed(4);
}

// Wallet Card Component
function WalletAuditCard({
  wallet,
  onViewDetail,
}: {
  wallet: WalletAuditSummaryResponse['wallets'][0];
  onViewDetail: (id: string) => void;
}) {
  const meta = getWalletMeta(wallet.id);
  const balance = parseFloat(wallet.balance || '0');
  const safeThreshold = meta.type === 'operational' ? 2 : 10;
  const progressPct = Math.min(100, (balance / safeThreshold) * 100);

  return (
    <Card className="border-l-4 border-l-gray-300 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{meta.title}</h3>
              <p className="text-sm text-gray-500">{meta.simple}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[wallet.status]}`}
          >
            {statusLabels[wallet.status]}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{meta.explain}</p>

        {/* Balance */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatAvax(wallet.balance)} AVAX</span>
            <span className="text-sm text-gray-400">
              (${wallet.balanceUsd?.toFixed(2) ?? '0.00'})
            </span>
          </div>
          {meta.type === 'operational' && (
            <div className="mt-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    progressPct < 25
                      ? 'bg-red-500'
                      : progressPct < 50
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Nguong an toan: {safeThreshold} AVAX</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-green-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500">Nhan vao</p>
            <p className="font-semibold text-green-700 text-sm">{formatAvax(wallet.totalIn)}</p>
          </div>
          <div className="bg-red-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500">Chi ra</p>
            <p className="font-semibold text-red-700 text-sm">{formatAvax(wallet.totalOut)}</p>
          </div>
          <div className="bg-blue-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500">Giao dich</p>
            <p className="font-semibold text-blue-700 text-sm">{wallet.txCount}</p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500">Dia chi</p>
            <button
              onClick={() => copyAddress(wallet.address)}
              className="font-mono text-xs text-gray-600 hover:text-blue-600 cursor-pointer"
              title={wallet.address}
            >
              {shortenAddress(wallet.address)}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {wallet.alerts && wallet.alerts.length > 0 && (
          <div className="mb-3">
            {wallet.alerts.map((alert, i) => (
              <p key={i} className="text-sm text-orange-700 bg-orange-50 rounded px-2 py-1 mb-1">
                {alert}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => onViewDetail(wallet.id)}>
            Xem chi tiet
          </Button>
          <a
            href={`https://snowscan.xyz/address/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="ghost">
              <ExternalLink className="h-4 w-4 mr-1" />
              Snowscan
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// Wallet Detail Modal
function WalletDetailModal({ walletId, onClose }: { walletId: string; onClose: () => void }) {
  const { data, isLoading } = useWalletAuditDetail(walletId);
  const meta = getWalletMeta(walletId);
  const audit = data as unknown as { ok?: boolean } & typeof data;

  // Handle the ApiResponse wrapper
  const detail = audit && 'wallet' in (audit as Record<string, unknown>) ? audit : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.icon}</span>
            <h2 className="text-xl font-bold">{meta.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
            </div>
          )}

          {detail && (
            <>
              {/* Description */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-1">Day la vi gi?</h3>
                <p className="text-sm text-gray-700">{meta.explain}</p>
                {meta.type === 'operational' && (
                  <p className="text-sm text-orange-700 mt-2">{meta.whenEmpty}</p>
                )}
              </div>

              {/* Address */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Dia chi:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {detail.wallet?.address}
                </code>
                <button
                  onClick={() => copyAddress(detail.wallet?.address || '')}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {/* Balance */}
              <div>
                <h3 className="font-semibold mb-2">So du hien tai</h3>
                <p className="text-3xl font-bold">
                  {formatAvax(detail.summary?.closingBalance)} AVAX
                </p>
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-semibold mb-2">
                  Thong ke ({detail.period?.from} - {detail.period?.to})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded p-3 text-center">
                    <p className="text-sm text-gray-500">Nhan vao</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatAvax(detail.summary?.totalIn)} AVAX
                    </p>
                  </div>
                  <div className="bg-red-50 rounded p-3 text-center">
                    <p className="text-sm text-gray-500">Chi ra</p>
                    <p className="text-lg font-bold text-red-700">
                      {formatAvax(detail.summary?.totalOut)} AVAX
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded p-3 text-center">
                    <p className="text-sm text-gray-500">Phi mang</p>
                    <p className="text-lg font-bold text-orange-700">
                      {formatAvax(detail.summary?.totalGasSpent)} AVAX
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Tong giao dich: {detail.summary?.transactionCount ?? 0}
                </p>
              </div>

              {/* Breakdown */}
              {detail.breakdown && detail.breakdown.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Phan loai chi tieu</h3>
                  <div className="space-y-2">
                    {detail.breakdown.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                      >
                        <span className="text-sm">{item.category}</span>
                        <div className="text-right">
                          <span className="font-mono text-sm">
                            {formatAvax(item.totalAvax)} AVAX
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            ({item.count} txs, {item.pct})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topup Guide */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold mb-1">Cach nap them</h3>
                <p className="text-sm text-gray-700">{meta.topupGuide}</p>
              </div>

              {/* Recent TXs */}
              {detail.recentTransactions && detail.recentTransactions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Giao dich gan day</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="pb-2">NFT</th>
                          <th className="pb-2">Gia</th>
                          <th className="pb-2">Phi</th>
                          <th className="pb-2">VIP</th>
                          <th className="pb-2">Luc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.recentTransactions.map((tx) => (
                          <tr key={tx.id} className="border-b">
                            <td className="py-1.5">#{tx.token_id}</td>
                            <td className="py-1.5">{formatAvax(tx.price_avax)}</td>
                            <td className="py-1.5 text-orange-600">
                              {formatAvax(tx.fee_amount_avax)}
                            </td>
                            <td className="py-1.5">
                              {tx.seller_is_vip ? (
                                <span className="text-green-600 text-xs">3%</span>
                              ) : (
                                <span className="text-gray-400 text-xs">5%</span>
                              )}
                            </td>
                            <td className="py-1.5 text-xs text-gray-400">
                              {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {detail.alerts && detail.alerts.length > 0 && (
                <div>
                  {detail.alerts.map((alert, i) => (
                    <p
                      key={i}
                      className="text-sm text-orange-700 bg-orange-50 rounded px-3 py-2 mb-1"
                    >
                      {alert.message}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function WalletAuditPage() {
  const [txPage, setTxPage] = useState(1);
  const { data, isLoading, error } = useWalletAuditSummary(txPage);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const auditData = data as unknown as WalletAuditSummaryResponse | undefined;
  const wallets = auditData?.wallets ?? [];
  const revenue = auditData?.revenue;
  const txs = auditData?.marketplaceTransactions ?? [];
  const txPagination = auditData?.marketplacePagination;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kiem Toan Vi</h1>
          <p className="text-gray-500 text-sm">
            Xem chi tiet tien vao/ra cua tung vi trong he thong
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['wallet-audit-summary'] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Lam moi
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Loi tai du lieu: {(error as Error).message}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      )}

      {auditData && (
        <>
          {/* Revenue Summary */}
          {revenue && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Doanh thu Platform</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">Tong phi da thu</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatAvax(revenue.feeCollectorBalance)} AVAX
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">Tong tien phi tu truoc</p>
                    <p className="text-2xl font-bold">
                      {formatAvax(revenue.feeCollectorTotalIn)} AVAX
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">So giao dich NFT</p>
                    <p className="text-2xl font-bold">{revenue.totalTransactions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">TB phi/giao dich</p>
                    <p className="text-2xl font-bold">{formatAvax(revenue.avgFeePerTx)} AVAX</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Wallet Cards */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Cac vi trong he thong</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {wallets.map((w) => (
                <WalletAuditCard key={w.id} wallet={w} onViewDetail={setSelectedWallet} />
              ))}
            </div>
          </div>

          {/* Marketplace Transaction History */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Lich su giao dich NFT</h2>
            {txs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  Chua co giao dich nao
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-gray-600">
                        <th className="px-3 py-2">NFT</th>
                        <th className="px-3 py-2">Nguoi ban</th>
                        <th className="px-3 py-2">Nguoi mua</th>
                        <th className="px-3 py-2">Gia</th>
                        <th className="px-3 py-2">Phi</th>
                        <th className="px-3 py-2">VIP?</th>
                        <th className="px-3 py-2">Luc</th>
                        <th className="px-3 py-2">TX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txs.map((tx) => (
                        <tr key={tx.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono">#{tx.token_id}</td>
                          <td className="px-3 py-2">{tx.seller_name || '---'}</td>
                          <td className="px-3 py-2">{tx.buyer_name || '---'}</td>
                          <td className="px-3 py-2">{formatAvax(tx.price_avax)}</td>
                          <td className="px-3 py-2 text-orange-600">
                            {formatAvax(tx.fee_amount_avax)}
                          </td>
                          <td className="px-3 py-2">
                            {tx.seller_is_vip ? (
                              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                                3%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">5%</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-3 py-2">
                            {tx.transfer_tx_hash && (
                              <a
                                href={`https://snowscan.xyz/tx/${tx.transfer_tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {txPagination && txPagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-gray-500">Tong: {txPagination.total} giao dich</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={txPage <= 1}
                        onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        {txPage} / {txPagination.pages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={txPage >= txPagination.pages}
                        onClick={() => setTxPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedWallet && (
        <WalletDetailModal walletId={selectedWallet} onClose={() => setSelectedWallet(null)} />
      )}
    </div>
  );
}
