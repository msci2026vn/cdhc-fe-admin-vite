import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Package, Download, Loader2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  useAdminClaimedSlots,
  useCreateBatch,
  useGeneratePdf,
  useDeliveryBatches,
} from '@/hooks/useDeliveryAdmin';
import { deliveryAdminApi } from '@/lib/api';
import type { AdminClaimedSlot } from '@/types/delivery';
import { useQueryClient } from '@tanstack/react-query';

type FlowStep = 'idle' | 'creating' | 'generating' | 'downloading';

export default function DeliveryAdminPage() {
  const queryClient = useQueryClient();

  // Form state
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [productName, setProductName] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [farmName, setFarmName] = useState('Nong trai Huu Co Da Lat');
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');

  // Data
  const { data: slotsResponse, isLoading: slotsLoading } = useAdminClaimedSlots();
  const { data: batchesResponse, isLoading: batchesLoading } = useDeliveryBatches();
  const createBatchMutation = useCreateBatch();
  const generatePdfMutation = useGeneratePdf();

  const claimedSlots: AdminClaimedSlot[] = useMemo(() => {
    const slots = slotsResponse?.data;
    if (!slots) return [];
    // BE đã filter batch_id IS NULL → chỉ trả slots chưa batch
    return Array.isArray(slots) ? slots : [];
  }, [slotsResponse]);

  const batches = useMemo(() => {
    const data = batchesResponse?.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [];
  }, [batchesResponse]);

  // Checkbox logic
  const allSelected = claimedSlots.length > 0 && selectedSlotIds.size === claimedSlots.length;

  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedSlotIds(new Set());
    } else {
      setSelectedSlotIds(new Set(claimedSlots.map((s) => s.slotId)));
    }
  };

  // Submit: create -> generate -> download
  const handleCreateBatch = async () => {
    if (selectedSlotIds.size === 0) {
      toast.error('Chua chon don nao');
      return;
    }
    if (!productName.trim()) {
      toast.error('Vui long nhap ten san pham');
      return;
    }
    if (!harvestDate) {
      toast.error('Vui long chon ngay thu hoach');
      return;
    }

    try {
      // Step 1: Create batch
      setFlowStep('creating');
      const createRes = await createBatchMutation.mutateAsync({
        slotIds: [...selectedSlotIds],
        productName: productName.trim(),
        harvestDate,
        farmName: farmName.trim() || undefined,
      });

      const batchId = createRes.data?.batchId;
      const batchNumber = createRes.data?.batchNumber || '';

      if (!batchId) {
        throw new Error('Khong nhan duoc batchId tu server');
      }

      // Step 2: Generate PDF
      setFlowStep('generating');
      await generatePdfMutation.mutateAsync(batchId);

      // Step 3: Download PDF
      setFlowStep('downloading');
      await deliveryAdminApi.downloadPdf(batchId, batchNumber);

      toast.success(`Da tao lo ${batchNumber} va tai phieu giao hang!`);

      // Reset form
      setSelectedSlotIds(new Set());
      setProductName('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      toast.error(message);
    } finally {
      setFlowStep('idle');
    }
  };

  // Download PDF from batch history
  const handleDownloadPdf = async (batchId: string, batchNumber: string, pdfUrl: string | null) => {
    try {
      if (!pdfUrl) {
        // PDF chưa generate -> generate trước
        toast.info('Đang tạo PDF...');
        await generatePdfMutation.mutateAsync(batchId);
      }
      await deliveryAdminApi.downloadPdf(batchId, batchNumber);
      toast.success('Đã tải PDF');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tải PDF thất bại';
      toast.error(message);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-claimed-slots'] });
    queryClient.invalidateQueries({ queryKey: ['delivery-batches'] });
  };

  const isProcessing = flowStep !== 'idle';
  const statusLabels = {
    creating: 'Đang tạo lô...',
    generating: 'Đang tạo PDF...',
    downloading: 'Đang tải...',
  };
  const buttonText = {
    idle: `Tạo lô & In phiếu (${selectedSlotIds.size} đã chọn)`,
    ...statusLabels,
  }[flowStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Giao hàng</h1>
          <p className="text-gray-500">Chon don dang ky, tao lo va in phieu giao hang</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Lam moi
        </Button>
      </div>

      {/* Section 1: Claimed Slots Table */}
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Don dang ky nhan qua
        </h2>

        {slotsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : claimedSlots.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
            <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Chưa có đơn đăng ký nhận quà nào.</p>
            <p className="text-sm mt-1">
              Người dùng VIP cần vào Vườn Của Tôi và bấm Nhận quà trước.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Chon tat ca"
                  />
                </TableHead>
                <TableHead>Nguoi nhan</TableHead>
                <TableHead>SDT</TableHead>
                <TableHead>Dia chi</TableHead>
                <TableHead>Ma OTP</TableHead>
                <TableHead>Tháng</TableHead>
                <TableHead>Ngay DK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claimedSlots.map((slot) => (
                <TableRow key={slot.slotId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSlotIds.has(slot.slotId)}
                      onCheckedChange={() => toggleSlot(slot.slotId)}
                      aria-label={`Chon ${slot.recipientName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{slot.recipientName}</div>
                    <div className="text-xs text-gray-500">{slot.userName}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{slot.recipientPhone}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={slot.recipientAddress}>
                      {slot.recipientAddress}
                    </div>
                    {slot.recipientNote && (
                      <div
                        className="text-xs text-gray-500 truncate max-w-[200px]"
                        title={slot.recipientNote}
                      >
                        Ghi chu: {slot.recipientNote}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">
                      {slot.otpCode}
                    </code>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{slot.monthYear}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {new Date(slot.claimedAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Section 2: Batch Form */}
      {claimedSlots.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-4 text-lg font-semibold">Thông tin lô giao hàng</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="productName">San pham *</Label>
              <Input
                id="productName"
                placeholder="VD: Cai bo xoi huu co"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Ngay thu hoach *</Label>
              <Input
                id="harvestDate"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmName">Nong trai</Label>
              <Input
                id="farmName"
                placeholder="Ten nong trai"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          <Button
            className="mt-4"
            onClick={handleCreateBatch}
            disabled={isProcessing || selectedSlotIds.size === 0 || !productName.trim()}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isProcessing && <FileText className="mr-2 h-4 w-4" />}
            {buttonText}
          </Button>
        </Card>
      )}

      {/* Section 3: Batch History */}
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lich su lo giao hang
        </h2>

        {batchesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Chua co lo nao.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium font-mono text-sm">{batch.batchNumber}</span>
                    <Badge variant={batch.pdfUrl ? 'default' : 'secondary'}>
                      {batch.pdfUrl ? 'Da in' : 'Chua in'}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{batch.productName}</span>
                    <span>{batch.slotCount} phieu</span>
                    <span>{new Date(batch.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(batch.id, batch.batchNumber, batch.pdfUrl)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Tai PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
