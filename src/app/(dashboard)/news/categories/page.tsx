import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CategoriesTable } from '@/components/news/CategoriesTable';
import { CategoryFormModal } from '@/components/news/CategoryFormModal';
import {
  useNewsCategories,
  useCreateNewsCategory,
  useUpdateNewsCategory,
  useDeleteNewsCategory,
} from '@/hooks/useNews';
import { toast } from 'sonner';
import type { NewsCategory, CreateCategoryData, UpdateCategoryData } from '@/types/news';

export default function NewsCategoriesPage() {
  const { data, isLoading } = useNewsCategories();
  const createCategory = useCreateNewsCategory();
  const updateCategory = useUpdateNewsCategory();
  const deleteCategory = useDeleteNewsCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsCategory | null>(null);

  const categories = data?.data || [];

  const handleEdit = (cat: NewsCategory) => {
    setEditingCategory(cat);
    setShowForm(true);
  };

  const handleSubmit = async (formData: CreateCategoryData | UpdateCategoryData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: formData });
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCategory.mutateAsync(formData as CreateCategoryData);
        toast.success('Đã tạo danh mục');
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success('Đã xóa danh mục');
      setDeleteTarget(null);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh mục tin tức</h1>
          <p className="text-gray-500">Quản lý danh mục phân loại tin tức</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <CategoriesTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <CategoryFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmit}
        category={editingCategory}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa danh mục &quot;{deleteTarget?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
