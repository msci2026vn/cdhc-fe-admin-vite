import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { ThumbnailUpload } from './ThumbnailUpload';
import { AudioUpload } from './AudioUpload';
import { YouTubeInput } from './YouTubeInput';
import { useNewsCategories } from '@/hooks/useNews';
import type { News } from '@/types/news';

const newsSchema = z.object({
  title: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(255),
  categoryId: z.string().optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
  status: z.enum(['draft', 'published']),
  youtubeVideoId: z.string().max(20).optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: NewsFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onThumbnailUpload?: (file: File) => void;
  onThumbnailDelete?: () => void;
  onAudioUpload?: (file: File) => void;
  onAudioDelete?: () => void;
  isThumbnailUploading?: boolean;
  isAudioUploading?: boolean;
}

export function NewsForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  onThumbnailUpload,
  onThumbnailDelete,
  onAudioUpload,
  onAudioDelete,
  isThumbnailUploading,
  isAudioUploading,
}: NewsFormProps) {
  const { data: categoriesData } = useNewsCategories();
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      categoryId: initialData?.categoryId || undefined,
      summary: initialData?.summary || '',
      content: initialData?.content || '',
      status: initialData?.status === 'published' ? 'published' : 'draft',
      youtubeVideoId: initialData?.youtubeVideoId || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || undefined,
        summary: initialData.summary || '',
        content: initialData.content,
        status: initialData.status === 'published' ? 'published' : 'draft',
        youtubeVideoId: initialData.youtubeVideoId || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input id="title" {...register('title')} placeholder="Nhập tiêu đề bài viết" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Danh mục</Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Đăng bài</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Label htmlFor="summary">Tóm tắt</Label>
        <Textarea
          id="summary"
          {...register('summary')}
          placeholder="Tóm tắt ngắn gọn..."
          rows={3}
        />
        {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Nội dung *</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => <RichTextEditor content={field.value} onChange={field.onChange} />}
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      {/* Media Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Media</h3>

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Ảnh đại diện</Label>
          <ThumbnailUpload
            currentUrl={initialData?.thumbnailUrl || null}
            onUpload={onThumbnailUpload || (() => {})}
            onDelete={onThumbnailDelete || (() => {})}
            isUploading={isThumbnailUploading}
          />
        </div>

        {/* Audio */}
        <div className="space-y-2">
          <Label>Audio (MP3)</Label>
          <AudioUpload
            currentUrl={initialData?.audioUrl || null}
            audioDuration={initialData?.audioDuration || null}
            audioFileSize={initialData?.audioFileSize || null}
            onUpload={onAudioUpload || (() => {})}
            onDelete={onAudioDelete || (() => {})}
            isUploading={isAudioUploading}
          />
        </div>

        {/* YouTube */}
        <div className="space-y-2">
          <Label>Video YouTube</Label>
          <Controller
            name="youtubeVideoId"
            control={control}
            render={({ field }) => (
              <YouTubeInput value={field.value || ''} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Tạo bài viết'}
        </Button>
      </div>
    </form>
  );
}
