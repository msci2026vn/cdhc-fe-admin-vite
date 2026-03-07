import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { formatNumber, formatDate } from '@/lib/utils';
import type { ConversionRecord } from '@/types/conversion';

interface Props {
  conversions: ConversionRecord[];
  isLoading: boolean;
  onViewDetail: (conversion: ConversionRecord) => void;
  onUserClick?: (userId: string) => void;
  onIpClick?: (ip: string) => void;
}

export function ConversionListTable({
  conversions,
  isLoading,
  onViewDetail,
  onUserClick,
  onIpClick,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Huong</TableHead>
              <TableHead>Moc</TableHead>
              <TableHead>Gui</TableHead>
              <TableHead>Phi</TableHead>
              <TableHead>Nhan</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Thoi gian</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 11 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
        Không có giao dịch nào
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Huong</TableHead>
            <TableHead>Moc</TableHead>
            <TableHead>Gui</TableHead>
            <TableHead>Phi</TableHead>
            <TableHead>Nhan</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Thoi gian</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversions.map((c, idx) => (
            <TableRow
              key={c.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onViewDetail(c)}
            >
              <TableCell className="font-mono text-xs text-gray-500">{idx + 1}</TableCell>
              <TableCell>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserClick?.(c.userId);
                  }}
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
                {formatNumber(c.fromAmount)} {c.fromCurrency}
              </TableCell>
              <TableCell className="text-sm text-red-500">{formatNumber(c.feeAmount)}</TableCell>
              <TableCell className="text-sm font-medium">
                {formatNumber(c.toAmount)} {c.toCurrency}
              </TableCell>
              <TableCell>{c.playerLevel}</TableCell>
              <TableCell>
                <button
                  className="font-mono text-xs text-gray-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIpClick?.(c.ipAddress);
                  }}
                >
                  {c.ipAddress}
                </button>
              </TableCell>
              <TableCell className="text-xs text-gray-500">{formatDate(c.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(c);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
