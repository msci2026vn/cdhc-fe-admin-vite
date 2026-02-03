import { useState, useMemo, useCallback } from 'react';
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
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  // Create preview URL for thumbnail
  const thumbnailPreview = useMemo(() => {
    if (!pendingThumbnail) return null;
    return URL.createObjectURL(pendingThumbnail);
  }, [pendingThumbnail]);

  // Create preview URL for audio and load metadata
  const audioPreview = useMemo(() => {
    if (!pendingAudio) return null;
    const url = URL.createObjectURL(pendingAudio);

    // Load audio metadata to get duration
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(Math.floor(audio.duration));
    });

    return url;
  }, [pendingAudio]);

  // Handlers with cleanup
  const handleThumbnailUpload = useCallback((file: File) => {
    setPendingThumbnail(file);
  }, []);

  const handleThumbnailDelete = useCallback(() => {
    setPendingThumbnail(null);
  }, []);

  const handleAudioUpload = useCallback((file: File) => {
    setPendingAudio(file);
    setAudioDuration(null);
  }, []);

  const handleAudioDelete = useCallback(() => {
    setPendingAudio(null);
    setAudioDuration(null);
  }, []);

  // Create preview data object
  const previewData = useMemo(() => {
    if (!thumbnailPreview && !audioPreview) return undefined;
    return {
      thumbnailUrl: thumbnailPreview,
      audioUrl: audioPreview,
      audioDuration: audioDuration,
      audioFileSize: pendingAudio?.size || null,
    } as const;
  }, [thumbnailPreview, audioPreview, audioDuration, pendingAudio]);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={previewData as any}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/news')}
        isSubmitting={isSubmitting}
        onThumbnailUpload={handleThumbnailUpload}
        onThumbnailDelete={handleThumbnailDelete}
        onAudioUpload={handleAudioUpload}
        onAudioDelete={handleAudioDelete}
        isThumbnailUploading={false}
        isAudioUploading={false}
      />
    </div>
  );
}
