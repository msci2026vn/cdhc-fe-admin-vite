/**
 * Legacy Member data structure (from Redis)
 * Thông tin thành viên cũ từ hệ thống legacy
 */
export interface LegacyMember {
  id: string;                      // Legacy member ID
  name: string;                    // Họ tên
  email: string;                   // Email
  phone: string;                   // Số điện thoại
  pid: string;                     // CMND/CCCD
  dob: string;                     // Ngày sinh (YYYY-MM-DD)
  joined: string;                  // Ngày tham gia (YYYY-MM-DD)
  rank: string;                    // Cấp bậc (e.g. "Thành Viên")
  shares: number;                  // Số cổ phần
  ogn: number;                     // OGN value
  tor: number;                     // TOR value
  f1_total: number;                // Tổng số F1 downlines
  f1s: string[];                   // Danh sách F1 IDs
}

/**
 * Recovery statistics
 * Thống kê khôi phục
 */
export interface RecoveryStats {
  total: number;                   // Tổng số thành viên legacy
  restored: number;                // Số đã khôi phục
  notRestored: number;             // Số chưa khôi phục
  recoveryRate: number;            // Tỷ lệ phần trăm (0-100)
  lastUpdated: string;             // ISO timestamp
}

/**
 * Recovery summary with breakdown
 * Tóm tắt khôi phục với phân loại
 */
export interface RecoverySummary {
  byRank: Record<string, number>;           // Đếm theo cấp bậc
  byMonth: Record<string, number>;          // Đếm theo tháng tham gia
  topF1Leaders: Array<{                     // Thành viên có nhiều F1 nhất
    email: string;
    name: string;
    f1_total: number;
  }>;
  recentJoins: LegacyMember[];              // Thành viên tham gia gần đây
}

/**
 * Pagination info
 * Thông tin phân trang
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API Response types
 * Các kiểu dữ liệu trả về từ API
 */
export interface LegacyMemberResponse {
  success: boolean;
  data: LegacyMember;
}

export interface LegacyMembersListResponse {
  success: boolean;
  data: LegacyMember[];
  pagination: Pagination;
}

export interface RecoveryStatsResponse {
  success: boolean;
  data: RecoveryStats;
}

export interface RecoverySummaryResponse {
  success: boolean;
  data: RecoverySummary;
}
