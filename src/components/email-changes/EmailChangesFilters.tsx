import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  search: string;
  status: string;
  from: string;
  to: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Đang chờ duyệt' },
  { value: 'completed', label: 'Đã chuyển đổi' },
  { value: 'disputed', label: 'Tranh chấp' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export function EmailChangesFilters({
  search,
  status,
  from,
  to,
  onSearchChange,
  onStatusChange,
  onFromChange,
  onToChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Tìm theo SĐT, email, tên..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="w-[150px]"
          placeholder="Từ ngày"
        />
        <span className="text-gray-400">-</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="w-[150px]"
          placeholder="Đến ngày"
        />
      </div>
    </div>
  );
}
