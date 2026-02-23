import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import type { ConversionRecord } from '@/types/conversion';

interface Props {
  conversions: ConversionRecord[];
  isLoading: boolean;
  onUserClick?: (userId: string) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vua xong';
  if (minutes < 60) return `${minutes} phut`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} gio`;
  return `${Math.floor(hours / 24)} ngay`;
}

export function ConversionRecentTable({ conversions, isLoading, onUserClick }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-medium">Giao dich gan day</p>
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="font-medium">Giao dich gan day</p>
        <Link to="/conversion/list" className="text-sm text-green-600 hover:text-green-700">
          Xem tat ca →
        </Link>
      </div>
      {conversions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Chua co giao dich nao</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Huong</TableHead>
              <TableHead>Moc</TableHead>
              <TableHead>So luong</TableHead>
              <TableHead>Thoi gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversions.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <button
                    className="text-left text-sm text-blue-600 hover:underline"
                    onClick={() => onUserClick?.(c.userId)}
                  >
                    {c.userName || c.userId.slice(0, 8) + '...'}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={c.direction === 'ogn_to_seed' ? 'warning' : 'success'}>
                    {c.direction === 'seed_to_ogn' ? 'Seed→OGN' : 'OGN→Seed'}
                  </Badge>
                </TableCell>
                <TableCell>{c.tierId}</TableCell>
                <TableCell className="text-sm">
                  {formatNumber(c.fromAmount)} → {formatNumber(c.toAmount)}
                </TableCell>
                <TableCell className="text-xs text-gray-500">{timeAgo(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
