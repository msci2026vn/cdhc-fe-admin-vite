import { MoreHorizontal, Eye, Pencil, Trash2, Globe, GlobeLock } from 'lucide-react';
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
import { formatDate } from '@/lib/utils';
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
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Ngày tạo</TableHead>
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
                  <Skeleton className="h-6 w-20" />
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
            <TableHead>Danh mục</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lượt xem</TableHead>
            <TableHead>Ngày tạo</TableHead>
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
              <TableCell className="text-sm text-gray-600">{item.category?.name || '-'}</TableCell>
              <TableCell>
                <Badge variant={NEWS_STATUS_VARIANTS[item.status]}>
                  {NEWS_STATUS_LABELS[item.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">{item.viewCount}</TableCell>
              <TableCell className="text-sm text-gray-500">{formatDate(item.createdAt)}</TableCell>
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
