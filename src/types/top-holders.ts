/**
 * Top Holders Types
 * Kiểu dữ liệu cho quản lý top holders
 * Sử dụng camelCase để match với backend response
 */

/**
 * Asset totals summary
 * Tổng hợp tài sản
 */
export interface AssetTotals {
  totalShares: number;
  totalOgn: number;
  totalTor: number;
  totalHolders: number;
  sharesHolders: number;
  ognHolders: number;
  torHolders: number;
  avgShares?: number;
  avgOgn?: number;
  avgTor?: number;
}

/**
 * Top holder information
 * Thông tin top holder
 */
export interface TopHolder {
  rank: number;
  id: string;
  email: string;
  name: string;
  shares: number;
  ogn: number;
  tor: number;
  totalAssets: number;
  legacyRank: string;
  createdAt: string;
}

/**
 * Distribution by rank
 * Phân phối theo cấp bậc
 */
export interface RankDistribution {
  rank: string;
  count: number;
  totalShares: number;
  totalOgn: number;
  totalTor: number;
  percentage: number;
}

/**
 * Concentration metrics
 * Chỉ số tập trung - 12 fields từ backend
 */
export interface ConcentrationMetrics {
  // Overall concentration (tổng hợp)
  top10Percentage: number;
  top50Percentage: number;
  top100Percentage: number;
  // Per-asset breakdown (theo từng loại tài sản)
  top10Shares: number;
  top10Ogn: number;
  top10Tor: number;
  top50Shares: number;
  top50Ogn: number;
  top50Tor: number;
  top100Shares: number;
  top100Ogn: number;
  top100Tor: number;
}

/**
 * Holder detail
 * Chi tiết holder
 */
export interface HolderDetail extends TopHolder {
  percentOfShares: number;
  percentOfOgn: number;
  percentOfTor: number;
  joinedDate?: string;
  lastActive?: string;
}

/**
 * Sort options
 * Tùy chọn sắp xếp
 */
export type AssetSortType = 'shares' | 'ogn' | 'tor' | 'total';

/**
 * List query params
 * Tham số truy vấn danh sách
 */
export interface TopHoldersQuery {
  limit?: number;
  sortBy?: AssetSortType;
}
