import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import { NEWS_STATUS_LABELS, NEWS_STATUS_VARIANTS } from '@/types/news';
import type { NewsCategory } from '@/types/news';

interface NewsPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string | null;
  audioUrl?: string | null;
  youtubeVideoId?: string;
  category?: NewsCategory | null;
  status: 'draft' | 'published' | 'archived';
}

export function NewsPreviewModal({
  open,
  onOpenChange,
  title,
  summary,
  content,
  thumbnailUrl,
  audioUrl,
  youtubeVideoId,
  category,
  status,
}: NewsPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-[#faf8f3]">
        <DialogHeader className="p-6 border-b sticky top-0 bg-white z-10 shadow-sm">
          <DialogTitle className="text-xl font-semibold">Xem trước bài viết</DialogTitle>
        </DialogHeader>

        <div className="p-6 md:p-10 lg:p-16 bg-[#faf8f3]">
          <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
            {/* Status & Category */}
            <div className="flex items-center gap-3 mb-6">
              <Badge
                variant={NEWS_STATUS_VARIANTS[status]}
                className="text-xs font-bold uppercase tracking-wider"
              >
                {NEWS_STATUS_LABELS[status]}
              </Badge>
              {category && (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider">
                  {category.name}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#061a06] leading-[1.2] mb-8">
              {title || 'Chưa có tiêu đề'}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-slate-200">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 text-sm">Admin</span>
                  <span className="text-xs text-slate-500 italic">Tác giả</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />0
                </span>
                <span className="flex items-center gap-1.5 text-red-500">
                  <Heart className="w-4 h-4" />0
                </span>
                <span className="flex items-center gap-1.5 text-blue-500">
                  <MessageCircle className="w-4 h-4" />0
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {thumbnailUrl && (
              <div className="rounded-2xl overflow-hidden mb-10 shadow-lg ring-1 ring-slate-200">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div className="text-lg md:text-xl text-gray-700 italic p-6 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg leading-[1.8] mb-10 font-medium">
                {summary}
              </div>
            )}

            {/* YouTube Video */}
            {youtubeVideoId && (
              <div className="aspect-video rounded-lg overflow-hidden mb-10">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="YouTube video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Audio Player */}
            {audioUrl && (
              <div className="bg-gray-50 p-4 rounded-lg mb-10">
                <p className="text-sm font-medium mb-2">Nghe bài viết</p>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Trình duyệt của bạn không hỗ trợ phát audio.
                </audio>
              </div>
            )}

            {/* Main Content */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#061a06]
                prose-h2:text-3xl prose-h2:leading-[2.25rem] prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:leading-8 prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-lg prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-gray-800
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-5
                prose-li:mb-2 prose-li:text-gray-800
                prose-strong:font-bold prose-strong:text-[#061a06]
                prose-a:text-blue-600 prose-a:underline prose-a:decoration-blue-300 hover:prose-a:decoration-blue-600
                prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-yellow-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700
                prose-hr:border-gray-200 prose-hr:my-8"
              dangerouslySetInnerHTML={{
                __html: content || '<p class="text-gray-400 italic">Chưa có nội dung</p>',
              }}
            />
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
