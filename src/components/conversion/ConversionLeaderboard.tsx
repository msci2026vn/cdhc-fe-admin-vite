import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/conversion';

interface Props {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onUserClick?: (userId: string) => void;
}

export function ConversionLeaderboard({ entries, isLoading, onUserClick }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <p className="font-medium">Top Converters</p>
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="font-medium">Top Converters</p>
        <Link to="/conversion/list" className="text-sm text-green-600 hover:text-green-700">
          Xem thêm →
        </Link>
      </div>
      {entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Chưa có dữ liệu</div>
      ) : (
        <div className="divide-y">
          {entries.map((entry, idx) => (
            <div key={entry.userId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-6 text-center text-sm font-bold text-gray-400">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <button
                  className="text-sm font-medium text-blue-600 hover:underline truncate block"
                  onClick={() => onUserClick?.(entry.userId)}
                >
                  {entry.userName || entry.userEmail || entry.userId.slice(0, 12) + '...'}
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {formatNumber(entry.totalConversions)} lan
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
