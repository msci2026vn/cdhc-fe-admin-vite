import { Search, RotateCcw } from 'lucide-react';
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
  userId: string;
  direction: string;
  tierId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  ipAddress: string;
  onUserIdChange: (v: string) => void;
  onDirectionChange: (v: string) => void;
  onTierIdChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onIpAddressChange: (v: string) => void;
  onReset: () => void;
}

export function ConversionListFilters({
  userId,
  direction,
  tierId,
  status,
  dateFrom,
  dateTo,
  ipAddress,
  onUserIdChange,
  onDirectionChange,
  onTierIdChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onIpAddressChange,
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
        <Select value={direction} onValueChange={onDirectionChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Huong" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca huong</SelectItem>
            <SelectItem value="seed_to_ogn">Seed→OGN</SelectItem>
            <SelectItem value="ogn_to_seed">OGN→Seed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierId} onValueChange={onTierIdChange}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Moc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca moc</SelectItem>
            <SelectItem value="1">Moc 1</SelectItem>
            <SelectItem value="2">Moc 2</SelectItem>
            <SelectItem value="3">Moc 3</SelectItem>
            <SelectItem value="4">Moc 4</SelectItem>
            <SelectItem value="5">Moc 5</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="completed">Thanh cong</SelectItem>
            <SelectItem value="failed">That bai</SelectItem>
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
        <Input
          placeholder="IP..."
          value={ipAddress}
          onChange={(e) => onIpAddressChange(e.target.value)}
          className="w-[130px] h-9"
        />
        <Button variant="outline" size="sm" className="h-9" onClick={onReset}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}
