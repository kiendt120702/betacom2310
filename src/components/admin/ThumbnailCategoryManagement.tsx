import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import { useThumbnailCategories, useCreateThumbnailCategory, useUpdateThumbnailCategory, useDeleteThumbnailCategory, ThumbnailCategory } from "@/hooks/useThumbnailCategories";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";

const ThumbnailCategoryManagement: React.FC = () => {
  const { data: categories = [], isLoading } = useThumbnailCategories();
  const createCategory = useCreateThumbnailCategory();
  const updateCategory = useUpdateThumbnailCategory();
  const deleteCategory = useDeleteThumbnailCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ThumbnailCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const handleOpenDialog = (category: ThumbnailCategory | null = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, name: categoryName });
      } else {
        await createCategory.mutateAsync(categoryName);
      }
      handleCloseDialog();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <StandardManagementLayout
      title="Quản lý Danh mục"
      icon={Folder}
      isLoading={isLoading}
      isEmpty={categories.length === 0}
      actionButton={{
        label: "Thêm Danh mục",
        onClick: () => handleOpenDialog(),
        icon: Plus,
      }}
      emptyState={{
        icon: Folder,
        title: "Chưa có danh mục nào",
        description: "Tạo danh mục đầu tiên để phân loại thumbnail.",
        actionButton: {
          label: "Thêm Danh mục Đầu Tiên",
          onClick: () => handleOpenDialog(),
          icon: Plus,
        },
      }}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Danh mục</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(category)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục "{category.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa Danh mục" : "Thêm Danh mục Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Thay đổi tên của danh mục."
                : "Tạo danh mục mới để phân loại thumbnail."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="category-name">Tên Danh mục</Label>
            <Input
              id="category-name"
              placeholder="Nhập tên danh mục..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardManagementLayout>
  );
};

export default ThumbnailCategoryManagement;