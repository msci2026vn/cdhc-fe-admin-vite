import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Globe,
  GlobeLock,
  Heart,
  MessageCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
import type { News } from '@/types/news';
import { NEWS_STATUS_LABELS, NEWS_STATUS_VARIANTS } from '@/types/news';

interface NewsTableProps {
  news: News[];
  isLoading: boolean;
  onEdit: (item: News) => void;
  onDelete: (item: News) => void;
  onPublish: (item: News) => void;
  onUnpublish: (item: News) => void;
}

export function NewsTable({
  news,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
}: NewsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">Chưa có bài viết nào</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Ảnh</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lượt xem</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Ngày đăng</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {news.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-400 text-xs">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell>
                <p className="font-medium line-clamp-1">{item.title}</p>
                {item.summary && (
                  <p className="text-sm text-gray-500 line-clamp-1">{item.summary}</p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={item.authorAvatar || ''} />
                    <AvatarFallback className="text-xs">
                      {item.authorName?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{item.authorName || 'Admin'}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {item.categoryName || item.category?.name || '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={NEWS_STATUS_VARIANTS[item.status]}>
                    {NEWS_STATUS_LABELS[item.status]}
                  </Badge>
                  {item.scheduledPublishAt && item.status === 'draft' && (
                    <span className="text-[10px] text-blue-600">
                      Lịch: {formatDate(item.scheduledPublishAt)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-500">{item.viewCount}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-sm text-red-500">
                  <Heart className="h-3.5 w-3.5" />
                  {formatCompactNumber(item.likeCount || 0)}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-sm text-blue-500">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {formatCompactNumber(item.commentCount || 0)}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {item.publishedAt ? formatDate(item.publishedAt) : formatDate(item.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(`/news/${item.slug}`, '_blank')}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem trước
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Sửa
                    </DropdownMenuItem>
                    {item.status === 'draft' ? (
                      <DropdownMenuItem onClick={() => onPublish(item)}>
                        <Globe className="mr-2 h-4 w-4" />
                        Đăng bài
                      </DropdownMenuItem>
                    ) : item.status === 'published' ? (
                      <DropdownMenuItem onClick={() => onUnpublish(item)}>
                        <GlobeLock className="mr-2 h-4 w-4" />
                        Gỡ bài
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
