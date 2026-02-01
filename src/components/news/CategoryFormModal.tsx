import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { NewsCategory } from '@/types/news';

const categorySchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => void;
  category?: NewsCategory | null;
  isSubmitting?: boolean;
}

export function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  category,
  isSubmitting,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      reset({ name: '', description: '', sortOrder: 0, isActive: true });
    }
  }, [category, reset]);

  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
          <DialogDescription>
            {category ? 'Cập nhật thông tin danh mục tin tức' : 'Tạo danh mục tin tức mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Tên danh mục *</Label>
            <Input id="cat-name" {...register('name')} placeholder="VD: Kỹ thuật canh tác" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">Mô tả</Label>
            <Textarea
              id="cat-desc"
              {...register('description')}
              placeholder="Mô tả ngắn..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-sort">Thứ tự sắp xếp</Label>
            <Input id="cat-sort" type="number" {...register('sortOrder')} className="w-24" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cat-active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked === true)}
            />
            <Label htmlFor="cat-active" className="cursor-pointer">
              Hoạt động
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : category ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
