import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsForm } from '@/components/news/NewsForm';
import { AdminCommentsSection } from '@/components/news/AdminCommentsSection';
import {
  useNewsDetail,
  useUpdateNews,
  useUploadThumbnail,
  useDeleteThumbnail,
  useUploadAudio,
  useDeleteAudio,
} from '@/hooks/useNews';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpdateNewsData } from '@/types/news';

export default function NewsEditPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data, isLoading } = useNewsDetail(id);
  const updateNews = useUpdateNews();
  const uploadThumbnail = useUploadThumbnail();
  const deleteThumbnail = useDeleteThumbnail();
  const uploadAudio = useUploadAudio();
  const deleteAudio = useDeleteAudio();

  const news = data?.data;

  const handleSubmit = async (formData: UpdateNewsData) => {
    try {
      await updateNews.mutateAsync({ id, data: formData });
      toast.success('Đã cập nhật bài viết');
      navigate('/news');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      await uploadThumbnail.mutateAsync({ newsId: id, file });
      toast.success('Đã tải ảnh lên');
    } catch {
      toast.error('Lỗi tải ảnh');
    }
  };

  const handleThumbnailDelete = async () => {
    try {
      await deleteThumbnail.mutateAsync(id);
      toast.success('Đã xóa ảnh');
    } catch {
      toast.error('Lỗi xóa ảnh');
    }
  };

  const handleAudioUpload = async (file: File) => {
    try {
      await uploadAudio.mutateAsync({ newsId: id, file });
      toast.success('Đã tải audio lên');
    } catch {
      toast.error('Lỗi tải audio');
    }
  };

  const handleAudioDelete = async () => {
    try {
      await deleteAudio.mutateAsync(id);
      toast.success('Đã xóa audio');
    } catch {
      toast.error('Lỗi xóa audio');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy bài viết</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/news')}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/news')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
          <p className="text-gray-500">{news.title}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <NewsForm
          initialData={news}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/news')}
          isSubmitting={updateNews.isPending}
          onThumbnailUpload={handleThumbnailUpload}
          onThumbnailDelete={handleThumbnailDelete}
          onAudioUpload={handleAudioUpload}
          onAudioDelete={handleAudioDelete}
          isThumbnailUploading={uploadThumbnail.isPending}
          isAudioUploading={uploadAudio.isPending}
        />
      </div>

      {/* Comments Section */}
      <AdminCommentsSection newsId={id} commentCount={news.commentCount} />
    </div>
  );
}
