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
  userId: string;
  failReason: string;
  ipAddress: string;
  dateFrom: string;
  dateTo: string;
  onUserIdChange: (v: string) => void;
  onFailReasonChange: (v: string) => void;
  onIpAddressChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onReset: () => void;
}

export function FailedAttemptsFilters({
  userId,
  failReason,
  ipAddress,
  dateFrom,
  dateTo,
  onUserIdChange,
  onFailReasonChange,
  onIpAddressChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="User ID..."
          value={userId}
          onChange={(e) => onUserIdChange(e.target.value)}
          className="h-9 flex-1 min-w-[160px]"
        />
        <Select value={failReason} onValueChange={onFailReasonChange}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Lý do" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lý do</SelectItem>
            <SelectItem value="insufficient_seed">Thiếu Hạt</SelectItem>
            <SelectItem value="insufficient_ogn">Thiếu OGN</SelectItem>
            <SelectItem value="level_too_low">Chưa đủ level</SelectItem>
            <SelectItem value="daily_limit_reached">Hết lượt ngày</SelectItem>
            <SelectItem value="weekly_limit_reached">Hết lượt tuần</SelectItem>
            <SelectItem value="cooldown_active">Đang cooldown</SelectItem>
            <SelectItem value="system_frozen">Hệ thống dừng</SelectItem>
            <SelectItem value="user_frozen">Bị khóa</SelectItem>
            <SelectItem value="duplicate_request">Trùng request</SelectItem>
            <SelectItem value="max_cap_exceeded">Vượt giới hạn</SelectItem>
            <SelectItem value="server_error">Lỗi hệ thống</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="IP..."
          value={ipAddress}
          onChange={(e) => onIpAddressChange(e.target.value)}
          className="w-[130px] h-9"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="w-[140px] h-9"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="w-[140px] h-9"
        />
        <Button variant="outline" size="sm" className="h-9" onClick={onReset}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}
