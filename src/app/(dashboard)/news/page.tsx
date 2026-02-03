import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { NewsTable } from '@/components/news/NewsTable';
import { NewsFilters } from '@/components/news/NewsFilters';
import { NewsPreviewModal } from '@/components/news/NewsPreviewModal';
import { Pagination } from '@/components/users/Pagination';
import {
  useNewsList,
  useDeleteNews,
  usePublishNews,
  useUnpublishNews,
  useNewsCategories,
  useNewsDetail,
} from '@/hooks/useNews';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils';
import type { News } from '@/types/news';

export default function NewsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);
  const [previewNewsId, setPreviewNewsId] = useState<string | null>(null);

  const debouncedSetSearch = useMemo(() => debounce((v: string) => setDebouncedSearch(v), 400), []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
    setPage(1);
  };

  const { data, isLoading } = useNewsList({
    page,
    limit,
    search: debouncedSearch,
    status,
    categoryId,
  });
  const { data: categoriesData } = useNewsCategories();
  const { data: previewData } = useNewsDetail(previewNewsId || '');
  const deleteNews = useDeleteNews();
  const publishNews = usePublishNews();
  const unpublishNews = useUnpublishNews();

  const newsList = data?.data?.news || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const categories = categoriesData?.data || [];
  const previewNews = previewData?.data || null;

  const handlePublish = async (item: News) => {
    try {
      await publishNews.mutateAsync(item.id);
      toast.success('Đã đăng bài');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleUnpublish = async (item: News) => {
    try {
      await unpublishNews.mutateAsync(item.id);
      toast.success('Đã gỡ bài');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNews.mutateAsync(deleteTarget.id);
      toast.success('Đã xóa bài viết');
      setDeleteTarget(null);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Tin tức</h1>
          <p className="text-gray-500">Quản lý bài viết và nội dung tin tức</p>
        </div>
        <Button onClick={() => navigate('/news/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo bài mới
        </Button>
      </div>

      <NewsFilters
        search={search}
        status={status}
        categoryId={categoryId}
        categories={categories}
        onSearchChange={handleSearchChange}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onCategoryChange={(v) => {
          setCategoryId(v);
          setPage(1);
        }}
      />

      <NewsTable
        news={newsList}
        isLoading={isLoading}
        onEdit={(item) => navigate(`/news/${item.id}/edit`)}
        onDelete={setDeleteTarget}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onPreview={(item) => setPreviewNewsId(item.id)}
      />

      <Pagination
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />

      {/* Preview Modal */}
      {previewNews && (
        <NewsPreviewModal
          open={!!previewNewsId}
          onOpenChange={(open) => !open && setPreviewNewsId(null)}
          title={previewNews.title}
          summary={previewNews.summary || undefined}
          content={previewNews.content}
          thumbnailUrl={previewNews.thumbnailUrl}
          audioUrl={previewNews.audioUrl}
          youtubeVideoId={previewNews.youtubeVideoId || undefined}
          category={previewNews.category || null}
          status={previewNews.status}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bài viết</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa &quot;{deleteTarget?.title}&quot;? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteNews.isPending}>
              {deleteNews.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
