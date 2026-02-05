import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_LABELS, STATUS_LABELS, ORG_TYPE_LABELS } from '@/types/user';

interface UserFiltersProps {
  search: string;
  role: string;
  status: string;
  orgType: string;
  hasPendingRole: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onOrgTypeChange: (value: string) => void;
  onHasPendingRoleChange: (value: boolean) => void;
}

const memberRoles = [
  'farmer',
  'community',
  'student',
  'business',
  'coop',
  'shop',
  'expert',
  'kol',
  'koc',
  'department',
];

export function UserFilters({
  search,
  role,
  status,
  orgType,
  hasPendingRole,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onOrgTypeChange,
  onHasPendingRoleChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Tìm theo email, tên..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tất cả vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả vai trò</SelectItem>
          {memberRoles.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r as keyof typeof ROLE_LABELS]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={orgType} onValueChange={onOrgTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tất cả loại TK" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả loại TK</SelectItem>
          <SelectItem value="individual">👤 Cá nhân</SelectItem>
          <SelectItem value="organization">🏢 Tổ chức</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Checkbox
          id="hasPendingRole"
          checked={hasPendingRole}
          onCheckedChange={(checked) => onHasPendingRoleChange(!!checked)}
        />
        <Label htmlFor="hasPendingRole" className="text-sm cursor-pointer">
          ⏳ Có yêu cầu nâng cấp
        </Label>
      </div>
    </div>
  );
}
