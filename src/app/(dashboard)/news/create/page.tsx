import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsForm } from '@/components/news/NewsForm';
import { useCreateNews, useUploadThumbnail, useUploadAudio } from '@/hooks/useNews';
import { toast } from 'sonner';
import type { CreateNewsData } from '@/types/news';

export default function NewsCreatePage() {
  const navigate = useNavigate();
  const createNews = useCreateNews();
  const uploadThumbnail = useUploadThumbnail();
  const uploadAudio = useUploadAudio();

  const [pendingThumbnail, setPendingThumbnail] = useState<File | null>(null);
  const [pendingAudio, setPendingAudio] = useState<File | null>(null);

  const handleSubmit = async (data: CreateNewsData) => {
    try {
      // 1. Create the news article
      const result = await createNews.mutateAsync(data);

      if (!result.success) {
        toast.error(result.error?.message || 'Tạo bài viết thất bại');
        return;
      }

      const newsId = result.data?.id;
      if (!newsId) {
        toast.error('Tạo bài viết thất bại - không nhận được ID');
        return;
      }

      // 2. Upload thumbnail if selected
      if (pendingThumbnail) {
        try {
          const thumbResult = await uploadThumbnail.mutateAsync({ newsId, file: pendingThumbnail });
          if (!thumbResult.success) {
            toast.error(thumbResult.error?.message || 'Lỗi tải ảnh đại diện');
          }
        } catch {
          toast.error('Tạo bài thành công nhưng lỗi tải ảnh đại diện');
        }
      }

      // 3. Upload audio if selected
      if (pendingAudio) {
        try {
          const audioResult = await uploadAudio.mutateAsync({ newsId, file: pendingAudio });
          if (!audioResult.success) {
            toast.error(audioResult.error?.message || 'Lỗi tải audio');
          }
        } catch {
          toast.error('Tạo bài thành công nhưng lỗi tải audio');
        }
      }

      toast.success('Đã tạo bài viết');
      navigate('/news');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo bài viết';
      toast.error(message);
    }
  };

  const isSubmitting = createNews.isPending || uploadThumbnail.isPending || uploadAudio.isPending;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/news')} className="mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo bài viết mới</h1>
          <p className="text-sm text-gray-600 mt-1">Điền thông tin bài viết và nhấn Tạo bài viết</p>
        </div>
      </div>

      {/* Form Content */}
      <NewsForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/news')}
        isSubmitting={isSubmitting}
        onThumbnailUpload={(file) => setPendingThumbnail(file)}
        onThumbnailDelete={() => setPendingThumbnail(null)}
        onAudioUpload={(file) => setPendingAudio(file)}
        onAudioDelete={() => setPendingAudio(null)}
        isThumbnailUploading={uploadThumbnail.isPending}
        isAudioUploading={uploadAudio.isPending}
      />
    </div>
  );
}
