import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVipConfigs, useUpdateVipConfig } from '@/hooks/useVipConfig';
import type { VipConfigItem } from '@/lib/api';

const TIER_LABEL: Record<string, string> = {
  standard: 'VIP Standard',
  premium: 'VIP Premium',
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function ConfigRow({ item }: { item: VipConfigItem }) {
  const [value, setValue] = useState(item.deliveriesPerDay);
  const [error, setError] = useState('');
  const update = useUpdateVipConfig();

  function handleSave() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 20) {
      setError('Giá trị phải là số nguyên từ 1 đến 20');
      return;
    }
    setError('');
    update.mutate({ tier: item.tier, deliveriesPerDay: n });
  }

  const isDirty = value !== item.deliveriesPerDay;

  return (
    <div className="py-4 space-y-2">
      <div className="text-base font-semibold text-gray-100">
        {TIER_LABEL[item.tier] ?? item.tier}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={20}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            setError('');
          }}
          className="w-24 rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-gray-100 text-sm focus:border-green-500 focus:outline-none"
        />
        <span className="text-gray-400 text-sm">hộp/ngày</span>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={update.isPending || !isDirty}
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        >
          {update.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
      {error && <div className="text-red-400 text-xs">{error}</div>}
      {item.updatedAt && (
        <div className="text-xs text-gray-500">
          Cập nhật lần cuối: {formatDate(item.updatedAt)}
          {item.updatedBy && <> bởi {item.updatedBy}</>}
        </div>
      )}
    </div>
  );
}

export default function VipConfigPage() {
  const { data, isLoading, error } = useVipConfigs();
  const configs: VipConfigItem[] = (data?.data as VipConfigItem[] | undefined) ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-7 h-7 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-100">Cấu hình VIP</h1>
      </div>

      <Card className="bg-gray-800 border-gray-700 max-w-xl">
        <CardContent className="p-4 divide-y divide-gray-700">
          {isLoading ? (
            <div className="text-gray-400 py-4">Đang tải...</div>
          ) : error ? (
            <div className="text-red-400 py-4">Lỗi tải dữ liệu</div>
          ) : configs.length === 0 ? (
            <div className="text-gray-500 py-4">Không có cấu hình nào</div>
          ) : (
            configs.map((item) => <ConfigRow key={item.tier} item={item} />)
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500 max-w-xl space-y-1">
        <p>Thay đổi có hiệu lực từ ngày tiếp theo (cron chạy 01:00 mỗi ngày).</p>
        <p>Hoặc user vào My Garden sẽ tạo slots mới nếu chưa có.</p>
      </div>
    </div>
  );
}
