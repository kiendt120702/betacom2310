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
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useThumbnailTypes, useCreateThumbnailType, useUpdateThumbnailType, useDeleteThumbnailType, ThumbnailType } from "@/hooks/useThumbnailTypes";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";

const ThumbnailTypeManagement: React.FC = () => {
  const { data: thumbnailTypes = [], isLoading } = useThumbnailTypes();
  const createThumbnailType = useCreateThumbnailType();
  const updateThumbnailType = useUpdateThumbnailType();
  const deleteThumbnailType = useDeleteThumbnailType();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingThumbnailType, setEditingThumbnailType] = useState<ThumbnailType | null>(null);
  const [thumbnailTypeName, setThumbnailTypeName] = useState("");

  const handleOpenDialog = (type: ThumbnailType | null = null) => {
    setEditingThumbnailType(type);
    setThumbnailTypeName(type ? type.name : "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingThumbnailType(null);
    setThumbnailTypeName("");
  };

  const handleSubmit = async () => {
    if (!thumbnailTypeName.trim()) return;

    try {
      if (editingThumbnailType) {
        await updateThumbnailType.mutateAsync({ id: editingThumbnailType.id, name: thumbnailTypeName });
      } else {
        await createThumbnailType.mutateAsync(thumbnailTypeName);
      }
      handleCloseDialog();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteThumbnailType.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createThumbnailType.isPending || updateThumbnailType.isPending;

  return (
    <StandardManagementLayout
      title="Quản lý Loại Thumbnail"
      icon={Tag}
      isLoading={isLoading}
      isEmpty={thumbnailTypes.length === 0}
      actionButton={{
        label: "Thêm Loại Thumbnail",
        onClick: () => handleOpenDialog(),
        icon: Plus,
      }}
      emptyState={{
        icon: Tag,
        title: "Chưa có loại thumbnail nào",
        description: "Tạo loại thumbnail đầu tiên để phân loại thiết kế.",
        actionButton: {
          label: "Thêm Loại Thumbnail Đầu Tiên",
          onClick: () => handleOpenDialog(),
          icon: Plus,
        },
      }}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Loại Thumbnail</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {thumbnailTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(type)}
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
                            Bạn có chắc chắn muốn xóa loại thumbnail "{type.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(type.id)}
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
              {editingThumbnailType ? "Sửa Loại Thumbnail" : "Thêm Loại Thumbnail Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingThumbnailType
                ? "Thay đổi tên của loại thumbnail."
                : "Tạo loại thumbnail mới để phân loại thiết kế."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="type-name">Tên Loại Thumbnail</Label>
            <Input
              id="type-name"
              placeholder="Nhập tên loại thumbnail..."
              value={thumbnailTypeName}
              onChange={(e) => setThumbnailTypeName(e.target.value)}
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

export default ThumbnailTypeManagement;