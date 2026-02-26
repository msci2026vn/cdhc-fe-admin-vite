import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  status: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  onStatusChange: (v: string) => void;
  onUserIdChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onReset: () => void;
}

export function TopupFilters({
  status,
  userId,
  dateFrom,
  dateTo,
  onStatusChange,
  onUserIdChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[160px]">
          <Input
            placeholder="User ID..."
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            className="h-9"
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="pending">Cho thanh toan</SelectItem>
            <SelectItem value="paid">Da thanh toan</SelectItem>
            <SelectItem value="transferring">Dang chuyen</SelectItem>
            <SelectItem value="completed">Hoan thanh</SelectItem>
            <SelectItem value="failed">That bai</SelectItem>
            <SelectItem value="expired">Het han</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="w-[140px] h-9"
          placeholder="Tu ngay"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="w-[140px] h-9"
          placeholder="Den ngay"
        />
        <Button variant="outline" size="sm" className="h-9" onClick={onReset}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}
