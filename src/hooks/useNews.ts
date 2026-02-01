import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  News,
  NewsCategory,
  NewsListParams,
  NewsListResponse,
  CreateNewsData,
  UpdateNewsData,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types/news';

const API_BASE = '/api/admin/news';
const CATEGORIES_BASE = '/api/admin/news/categories';

// ==========================================
// News Categories
// ==========================================

export function useNewsCategories() {
  return useQuery({
    queryKey: ['news-categories'],
    queryFn: () => api.get<NewsCategory[]>(CATEGORIES_BASE),
  });
}

export function useCreateNewsCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryData) => api.post<NewsCategory>(CATEGORIES_BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-categories'] });
    },
  });
}

export function useUpdateNewsCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      api.put<NewsCategory>(`${CATEGORIES_BASE}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-categories'] });
    },
  });
}

export function useDeleteNewsCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${CATEGORIES_BASE}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-categories'] });
    },
  });
}

// ==========================================
// News
// ==========================================

export function useNewsList(params: NewsListParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.categoryId && params.categoryId !== 'all') query.set('categoryId', params.categoryId);
  if (params.search) query.set('search', params.search);

  return useQuery({
    queryKey: ['news', params],
    queryFn: () => api.get<NewsListResponse>(`${API_BASE}?${query.toString()}`),
  });
}

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => api.get<News>(`${API_BASE}/${id}`),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNewsData) => api.post<News>(API_BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsData }) =>
      api.put<News>(`${API_BASE}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${API_BASE}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function usePublishNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<News>(`${API_BASE}/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useUnpublishNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<News>(`${API_BASE}/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

// ==========================================
// Media Upload
// ==========================================

export function useUploadThumbnail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ newsId, file }: { newsId: string; file: File }) => {
      const formData = new FormData();
      formData.append('thumbnail', file);
      return api.request<News>(`${API_BASE}/${newsId}/thumbnail`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useDeleteThumbnail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newsId: string) => api.delete<News>(`${API_BASE}/${newsId}/thumbnail`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useUploadAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ newsId, file }: { newsId: string; file: File }) => {
      const formData = new FormData();
      formData.append('audio', file);
      return api.request<News>(`${API_BASE}/${newsId}/audio`, {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useDeleteAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newsId: string) => api.delete<News>(`${API_BASE}/${newsId}/audio`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}
