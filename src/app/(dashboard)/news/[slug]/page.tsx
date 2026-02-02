'use client';

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNewsBySlug } from '@/hooks/useNews';
import { formatDate } from '@/lib/utils';
import { NEWS_STATUS_LABELS, NEWS_STATUS_VARIANTS } from '@/types/news';

function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useNewsBySlug(slug || '');

  const news = response?.success ? response.data : null;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/news')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 text-lg">Không tìm thấy bài viết</p>
            <p className="text-gray-500 mt-2">Bài viết có thể đã bị xóa hoặc không tồn tại.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/news')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      {/* Article Card */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Status Badge */}
          <div>
            <Badge variant={NEWS_STATUS_VARIANTS[news.status]}>
              {NEWS_STATUS_LABELS[news.status]}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold">{news.title}</h1>

          {/* Category */}
          {news.category && (
            <p className="text-sm text-gray-600">
              Danh mục: <span className="font-medium">{news.category.name}</span>
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={news.authorAvatar || ''} />
                <AvatarFallback>{news.authorName?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{news.authorName || 'Admin'}</p>
                {news.authorRole && <p className="text-xs text-gray-500">{news.authorRole}</p>}
              </div>
            </div>

            {/* Published Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {news.publishedAt ? formatDate(news.publishedAt) : formatDate(news.createdAt)}
            </div>

            {/* View Count */}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {formatCompactNumber(news.viewCount)}
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1 text-red-500">
              <Heart className="h-4 w-4" />
              {formatCompactNumber(news.likeCount || 0)}
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1 text-blue-500">
              <MessageCircle className="h-4 w-4" />
              {formatCompactNumber(news.commentCount || 0)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Thumbnail */}
          {news.thumbnailUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={news.thumbnailUrl}
                alt={news.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Summary */}
          {news.summary && (
            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-700 font-medium italic">{news.summary}</p>
            </div>
          )}

          {/* YouTube Video */}
          {news.youtubeVideoId && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${news.youtubeVideoId}`}
                title="YouTube video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Audio Player */}
          {news.audioUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Nghe bài viết</p>
              <audio controls className="w-full">
                <source src={news.audioUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
              {news.audioDuration && (
                <p className="text-xs text-gray-500 mt-1">
                  Thời lượng: {Math.floor(news.audioDuration / 60)}:
                  {String(news.audioDuration % 60).padStart(2, '0')}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Footer Info */}
          <div className="pt-6 border-t text-sm text-gray-500">
            <p>Tạo lúc: {formatDate(news.createdAt)}</p>
            <p>Cập nhật: {formatDate(news.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
