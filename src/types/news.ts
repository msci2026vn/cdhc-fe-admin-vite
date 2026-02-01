export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface News {
  id: string;
  categoryId: string | null;
  category?: NewsCategory;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnailUrl: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  viewCount: number;
  audioUrl: string | null;
  audioDuration: number | null;
  audioFileSize: number | null;
  youtubeVideoId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListParams {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  search?: string;
}

export interface NewsListResponse {
  news: News[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateNewsData {
  categoryId?: string;
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  status: 'draft' | 'published';
  youtubeVideoId?: string;
}

export type UpdateNewsData = Partial<CreateNewsData>;

export interface CreateCategoryData {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export const NEWS_STATUS_LABELS: Record<string, string> = {
  draft: 'Bản nháp',
  published: 'Đã đăng',
  archived: 'Lưu trữ',
};

export const NEWS_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'secondary'> = {
  draft: 'warning',
  published: 'success',
  archived: 'secondary',
};
