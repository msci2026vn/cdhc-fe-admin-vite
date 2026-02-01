import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsForm } from '@/components/news/NewsForm';
import { useCreateNews } from '@/hooks/useNews';
import { toast } from 'sonner';
import type { CreateNewsData } from '@/types/news';

export default function NewsCreatePage() {
  const navigate = useNavigate();
  const createNews = useCreateNews();

  const handleSubmit = async (data: CreateNewsData) => {
    try {
      await createNews.mutateAsync(data);
      toast.success('Đã tạo bài viết');
      navigate('/news');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

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
          isSubmitting={createNews.isPending}
        />
      </div>
    </div>
  );
}
