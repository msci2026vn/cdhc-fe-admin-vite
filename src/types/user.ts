export type UserRole =
  | 'farmer'
  | 'community'
  | 'business'
  | 'coop'
  | 'shop'
  | 'expert'
  | 'kol'
  | 'koc'
  | 'super_admin'
  | 'admin'
  | 'editor';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  picture?: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
}

export interface UserProfile extends User {
  profile: {
    fullName: string | null;
    phone: string | null;
    province: string | null;
    district: string | null;
    farmSize?: string | null;
    mainProducts?: string[] | null;
    department?: string | null;
    position?: string | null;
    [key: string]: unknown;
  } | null;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: 'Nhà nông',
  community: 'Cộng đồng',
  business: 'Doanh nghiệp',
  coop: 'Hợp tác xã',
  shop: 'Cửa hàng',
  expert: 'Chuyên gia',
  kol: 'KOL',
  koc: 'KOC',
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  suspended: 'Đình chỉ',
};

export const STATUS_COLORS: Record<UserStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-100 text-gray-800',
};
