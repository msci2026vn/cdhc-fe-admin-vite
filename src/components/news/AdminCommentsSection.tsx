import { useState } from 'react';
import { Trash2, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAdminNewsComments, useAdminDeleteComment } from '@/hooks/useNews';
import { formatDate } from '@/lib/utils';
import type { NewsComment } from '@/types/news';

interface AdminCommentsSectionProps {
  newsId: string;
  commentCount?: number;
}

export function AdminCommentsSection({ newsId, commentCount = 0 }: AdminCommentsSectionProps) {
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, isFetching } = useAdminNewsComments(newsId, { page, limit: 10 });
  const deleteComment = useAdminDeleteComment();

  const comments: NewsComment[] = data?.data?.items || [];
  const pagination = data?.data?.pagination;
  const totalComments = pagination?.total || commentCount;

  const handleDelete = (commentId: string) => {
    deleteComment.mutate({ newsId, commentId });
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Bình luận ({totalComments})
          </span>
          <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Chưa có bình luận nào
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={comment.userAvatar || ''} />
                    <AvatarFallback>
                      {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                    {comment.likeCount > 0 && (
                      <span className="text-xs text-gray-400 mt-1 inline-block">
                        {comment.likeCount} likes
                      </span>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        disabled={deleteComment.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bình luận của &quot;{comment.userName}&quot; sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(comment.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1 || isFetching}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Trước
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Trang {page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Tiếp
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
