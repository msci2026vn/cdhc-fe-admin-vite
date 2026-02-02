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
      const newsId = result.data?.id;

      if (!newsId) {
        toast.error('Tạo bài viết thất bại');
        return;
      }

      // 2. Upload thumbnail if selected
      if (pendingThumbnail) {
        try {
          await uploadThumbnail.mutateAsync({ newsId, file: pendingThumbnail });
        } catch {
          toast.error('Tạo bài thành công nhưng lỗi tải ảnh đại diện');
        }
      }

      // 3. Upload audio if selected
      if (pendingAudio) {
        try {
          await uploadAudio.mutateAsync({ newsId, file: pendingAudio });
        } catch {
          toast.error('Tạo bài thành công nhưng lỗi tải audio');
        }
      }

      toast.success('Đã tạo bài viết');
      navigate('/news');
    } catch {
      toast.error('Có lỗi xảy ra khi tạo bài viết');
    }
  };

  const isSubmitting = createNews.isPending || uploadThumbnail.isPending || uploadAudio.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/news')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo bài viết mới</h1>
          <p className="text-gray-500">Soạn và đăng bài viết tin tức</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
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
    </div>
  );
}
