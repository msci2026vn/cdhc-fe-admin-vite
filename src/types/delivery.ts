// ============================================
// Delivery Admin Types (Phase 6G)
// ============================================

/** Admin: slot da claimed (cho bang chon) */
export interface AdminClaimedSlot {
  slotId: string;
  slotNumber: number;
  monthYear: string;
  userName: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientNote: string | null;
  otpCode: string;
  claimedAt: string;
}

/** Admin: lo giao hang */
export interface DeliveryBatch {
  id: string;
  batchNumber: string;
  slotCount: number;
  productName: string;
  harvestDate: string;
  status: string;
  pdfUrl: string | null;
  createdAt: string;
}

/** Admin: request tao lo */
export interface CreateBatchRequest {
  slotIds: string[];
  productName: string;
  harvestDate: string;
  farmName?: string;
  farmAddress?: string;
  farmHotline?: string;
}

/** Admin: response tao lo */
export interface CreateBatchResult {
  batchId: string;
  batchNumber: string;
  slotCount: number;
}

/** Admin: response generate PDF */
export interface GeneratePdfResult {
  pdfUrl: string;
  pageCount: number;
}
