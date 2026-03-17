import { useState } from 'react';
import { ExternalLink, Shield, Activity, Users, Clock } from 'lucide-react';
import { useChainProofStats, useChainProofList } from '@/hooks/useChainProof';

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="bg-green-50 p-3 rounded-lg">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ChainProofPage() {
  const [page, setPage] = useState(1);
  const { data: statsRes, isLoading: statsLoading } = useChainProofStats();
  const { data: listRes, isLoading: listLoading } = useChainProofList(page);

  const stats = statsRes?.data;
  const list = listRes?.data;

  const fmt = (d?: string) => (d ? new Date(d).toLocaleString('vi-VN') : '—');

  const shortHash = (h?: string) => (h ? h.slice(0, 8) + '...' + h.slice(-6) : '—');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            On-chain Proof Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tất cả game actions được ghi trên Avalanche C-Chain
          </p>
        </div>
        {stats && (
          <a
            href={stats.snowtrace_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Xem ví deployer
          </a>
        )}
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <p className="text-gray-400 text-sm">Đang tải...</p>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Tổng TX on-chain"
            value={stats.summary.total_tx}
            icon={Activity}
            sub="Avalanche mainnet"
          />
          <StatCard
            label="Người chơi"
            value={stats.summary.unique_players}
            icon={Users}
            sub="unique wallets"
          />
          <StatCard label="TX đầu tiên" value={fmt(stats.summary.first_tx_at)} icon={Clock} />
          <StatCard label="TX gần nhất" value={fmt(stats.summary.last_tx_at)} icon={Clock} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Leaderboard — Nhiều TX nhất</h2>
          {stats?.leaderboard.length ? (
            <div className="space-y-3">
              {stats.leaderboard.map((p, i) => (
                <div key={p.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        i === 0 ? 'bg-yellow-100 text-yellow-700' : '',
                        i === 1 ? 'bg-gray-100 text-gray-600' : '',
                        i === 2 ? 'bg-orange-100 text-orange-600' : '',
                        i > 2 ? 'bg-gray-50 text-gray-500' : '',
                      ].join(' ')}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-800 font-medium">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{p.tx_count} tx</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Recent TX */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">TX gần nhất</h2>
          {stats?.recent_tx.length ? (
            <div className="space-y-3">
              {stats.recent_tx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {tx.winner_name}
                      <span className="text-gray-400 font-normal"> vs </span>
                      {tx.loser_name}
                    </p>
                    <p className="text-xs text-gray-400">{fmt(tx.created_at)}</p>
                  </div>
                  <a
                    href={`https://snowtrace.io/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:underline font-mono"
                  >
                    {shortHash(tx.tx_hash)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Chưa có TX</p>
          )}
        </div>
      </div>

      {/* TX Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Tất cả TX on-chain</h2>
        {listLoading ? (
          <p className="text-gray-400 text-sm">Đang tải...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 pr-4">Thời gian</th>
                    <th className="pb-3 pr-4">Winner</th>
                    <th className="pb-3 pr-4">Loser</th>
                    <th className="pb-3 pr-4">TX Hash</th>
                    <th className="pb-3">IPFS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {list?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                        {fmt(item.created_at)}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{item.winner_name}</td>
                      <td className="py-3 pr-4 text-gray-600">{item.loser_name}</td>
                      <td className="py-3 pr-4">
                        <a
                          href={item.explorer_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline font-mono text-xs"
                        >
                          {shortHash(item.tx_hash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3">
                        {item.ipfs_hash ? (
                          <a
                            href={`https://ipfs.io/ipfs/${item.ipfs_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-500 hover:underline text-xs"
                          >
                            IPFS
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {list && list.pagination.total > list.pagination.limit && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Tổng {list.pagination.total} tx</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Trang trước
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-500">Trang {page}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * list.pagination.limit >= list.pagination.total}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
