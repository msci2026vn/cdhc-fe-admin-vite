import { useEffect, useState } from 'react';
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
import { Eye, Clock } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ThumbnailUpload } from './ThumbnailUpload';
import { AudioUpload } from './AudioUpload';
import { YouTubeInput } from './YouTubeInput';
import { FillTemplateButton } from './FillTemplateButton';
import { NewsPreviewModal } from './NewsPreviewModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNewsCategories } from '@/hooks/useNews';
import { formatDate } from '@/lib/utils';
import type { News, CreateNewsData } from '@/types/news';
import type { NewsTemplate } from './newsTemplates';

const newsSchema = z.object({
  title: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(255),
  categoryId: z.string().optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
  status: z.enum(['draft', 'published']),
  youtubeVideoId: z.string().max(20).optional(),
  scheduledPublishAt: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: CreateNewsData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onThumbnailUpload?: (file: File) => void;
  onThumbnailDelete?: () => void;
  onAudioUpload?: (file: File) => void;
  onAudioDelete?: () => void;
  isThumbnailUploading?: boolean;
  isAudioUploading?: boolean;
}

/** Convert ISO string to datetime-local input value (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      categoryId: initialData?.categoryId || undefined,
      summary: initialData?.summary || '',
      content: initialData?.content || '',
      status: (initialData?.status === 'archived' ? 'draft' : initialData?.status) || 'draft',
      youtubeVideoId: initialData?.youtubeVideoId || '',
      scheduledPublishAt: toDatetimeLocal(initialData?.scheduledPublishAt),
    },
  });

  const watchedFields = watch();
  const selectedCategory = categories.find((c) => c.id === watchedFields.categoryId);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        categoryId: initialData.categoryId || undefined,
        summary: initialData.summary || '',
        content: initialData.content,
        status: (initialData.status === 'archived' ? 'draft' : initialData.status) || 'draft',
        youtubeVideoId: initialData.youtubeVideoId || '',
        scheduledPublishAt: toDatetimeLocal(initialData.scheduledPublishAt),
      });
    }
  }, [initialData, reset]);

  const handleFillTemplate = (template: NewsTemplate) => {
    setValue('title', template.title);
    setValue('summary', template.summary);
    setValue('content', template.content);
  };

  const handleFormSubmit = (data: NewsFormValues) => {
    const submitData: CreateNewsData = {
      ...data,
      scheduledPublishAt: data.scheduledPublishAt
        ? new Date(data.scheduledPublishAt).toISOString()
        : null,
    };
    onSubmit(submitData);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Author Info (read-only, edit mode) */}
        {initialData && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Thông tin tác giả</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={initialData.authorAvatar || ''} />
                  <AvatarFallback>
                    {initialData.authorName?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{initialData.authorName || 'Admin'}</p>
                  {initialData.authorRole && (
                    <p className="text-xs text-gray-500">{initialData.authorRole}</p>
                  )}
                  <p className="text-xs text-gray-400">Tạo: {formatDate(initialData.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <FillTemplateButton onFill={handleFillTemplate} disabled={isSubmitting} />
          <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Xem trước
          </Button>
        </div>

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
                    <SelectItem value="published">Đăng ngay</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Scheduled Publish */}
        <div className="space-y-2">
          <Label htmlFor="scheduledPublishAt" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lên lịch đăng bài
          </Label>
          <Input
            id="scheduledPublishAt"
            type="datetime-local"
            {...register('scheduledPublishAt')}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-xs text-gray-500">
            Để trống nếu muốn đăng ngay hoặc lưu nháp. Khi đặt lịch, bài sẽ tự động đăng khi đến
            giờ.
          </p>
          {watchedFields.scheduledPublishAt && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                <Clock className="h-3 w-3" />
                Đã lên lịch: {new Date(watchedFields.scheduledPublishAt).toLocaleString('vi-VN')}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-red-500 hover:text-red-700"
                onClick={() => setValue('scheduledPublishAt', '')}
              >
                Hủy lịch
              </Button>
            </div>
          )}
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
            render={({ field }) => (
              <RichTextEditor content={field.value} onChange={field.onChange} />
            )}
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

      {/* Preview Modal */}
      <NewsPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        title={watchedFields.title}
        summary={watchedFields.summary}
        content={watchedFields.content}
        thumbnailUrl={initialData?.thumbnailUrl}
        audioUrl={initialData?.audioUrl}
        youtubeVideoId={watchedFields.youtubeVideoId}
        category={selectedCategory}
        status={watchedFields.status}
      />
    </>
  );
}
