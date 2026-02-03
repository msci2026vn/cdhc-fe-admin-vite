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

export type NewsStatus = 'draft' | 'published' | 'archived';

export interface News {
  id: string;
  categoryId: string | null;
  category?: NewsCategory;
  categoryName?: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnailUrl: string | null;
  status: NewsStatus;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
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

export interface NewsCommentListResponse {
  items: NewsComment[];
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
  status?: 'draft' | 'published';
  youtubeVideoId?: string;
  scheduledPublishAt?: string | null;
}

export type UpdateNewsData = Partial<CreateNewsData>;

export interface CreateCategoryData {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export interface NewsComment {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
}

export const NEWS_STATUS_LABELS: Record<string, string> = {
  draft: 'Bản nháp',
  published: 'Đã đăng',
  archived: 'Lưu trữ',
};

export const NEWS_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'secondary' | 'default'> =
  {
    draft: 'warning',
    published: 'success',
    archived: 'secondary',
  };
