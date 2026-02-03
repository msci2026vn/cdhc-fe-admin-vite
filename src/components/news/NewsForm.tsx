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
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
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
    getValues,
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
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
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
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
      });
    }
  }, [initialData, reset]);

  const handleFillTemplate = (template: NewsTemplate) => {
    setValue('title', template.title);
    setValue('summary', template.summary);
    setValue('content', template.content);

    // Fill SEO fields if provided
    if (template.metaTitle) {
      setValue('metaTitle', template.metaTitle);
    }
    if (template.metaDescription) {
      setValue('metaDescription', template.metaDescription);
    }

    // Try to match category by name if provided
    if (template.categoryName) {
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === template.categoryName?.toLowerCase(),
      );
      if (matchedCategory) {
        setValue('categoryId', matchedCategory.id);
      }
    }
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
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header with Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Thông tin chi tiết</CardTitle>
                  <div className="flex items-center gap-2">
                    <FillTemplateButton onFill={handleFillTemplate} disabled={isSubmitting} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem trước
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input id="title" {...register('title')} placeholder="Nhập tiêu đề bài viết" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                {/* Slug - Auto-generated hint */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={
                      watchedFields.title
                        ?.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '') || 'tu-dong-tao-tu-tieu-de'
                    }
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Chỉ dùng chữ thường, số và dấu gạch ngang</p>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <Label htmlFor="summary">Tóm tắt</Label>
                  <Textarea
                    id="summary"
                    {...register('summary')}
                    placeholder="Mô tả ngắn gọn về bài viết (hiển thị trong danh sách)"
                    rows={3}
                  />
                  {errors.summary && (
                    <p className="text-sm text-red-500">{errors.summary.message}</p>
                  )}
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
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO (Tối ưu hóa công cụ tìm kiếm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      {...register('metaTitle')}
                      placeholder="Tiêu đề hiển thị trên Google (tối đa 60 ký tự)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500">
                      {watchedFields.metaTitle?.length || 0}/60 ký tự
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      {...register('metaDescription')}
                      placeholder="Mô tả hiển thị trên Google (tối đa 160 ký tự)"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500">
                      {watchedFields.metaDescription?.length || 0}/160 ký tự
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Media (Audio, YouTube) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Media bổ sung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="draft"
                          checked={field.value === 'draft'}
                          onChange={() => field.onChange('draft')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-sm">Nháp</p>
                          <p className="text-xs text-gray-500">
                            Lưu nháp, chưa công khai trên website
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="published"
                          checked={field.value === 'published'}
                          onChange={() => field.onChange('published')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-sm">Xuất bản</p>
                          <p className="text-xs text-gray-500">Hiển thị công khai trên website</p>
                        </div>
                      </label>
                    </div>
                  )}
                />

                {/* Scheduled Publish */}
                <div className="space-y-2 pt-3 border-t">
                  <Label htmlFor="scheduledPublishAt" className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    Lên lịch đăng bài
                  </Label>
                  <Input
                    id="scheduledPublishAt"
                    type="datetime-local"
                    {...register('scheduledPublishAt')}
                    min={new Date().toISOString().slice(0, 16)}
                    className="text-sm"
                  />
                  {watchedFields.scheduledPublishAt && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <Clock className="h-3 w-3" />
                        {new Date(watchedFields.scheduledPublishAt).toLocaleString('vi-VN')}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-red-500 hover:text-red-700"
                        onClick={() => setValue('scheduledPublishAt', '')}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || 'none'}
                      onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Không phân loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không phân loại</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </CardContent>
            </Card>

            {/* Featured Image Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent>
                <ThumbnailUpload
                  currentUrl={initialData?.thumbnailUrl || null}
                  onUpload={onThumbnailUpload || (() => {})}
                  onDelete={onThumbnailDelete || (() => {})}
                  isUploading={isThumbnailUploading}
                />
              </CardContent>
            </Card>

            {/* Author Info (only in edit mode) */}
            {initialData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin tác giả</CardTitle>
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
                      <p className="text-xs text-gray-400">
                        Tạo: {formatDate(initialData.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions - Bottom */}
        <div className="flex items-center justify-end gap-3 border-t pt-6 mt-6">
          <p className="text-sm text-gray-500 mr-auto">
            {watchedFields.status === 'draft'
              ? 'Bài viết sẽ được lưu nháp'
              : 'Bài viết sẽ được xuất bản ngay'}
          </p>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Tạo bài viết'}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <NewsPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        title={getValues('title')}
        summary={getValues('summary')}
        content={getValues('content')}
        thumbnailUrl={initialData?.thumbnailUrl}
        audioUrl={initialData?.audioUrl}
        youtubeVideoId={getValues('youtubeVideoId')}
        category={selectedCategory}
        status={getValues('status')}
      />
    </>
  );
}
