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
import { Plus, Edit, Trash2, Tag as TagIcon } from "lucide-react";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, Tag } from "@/hooks/useTags";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";

const TagManagement: React.FC = () => {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");

  const handleOpenDialog = (tag: Tag | null = null) => {
    setEditingTag(tag);
    setTagName(tag ? tag.name : "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTag(null);
    setTagName("");
  };

  const handleSubmit = async () => {
    if (!tagName.trim()) return;

    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.id, name: tagName });
      } else {
        await createTag.mutateAsync(tagName);
      }
      handleCloseDialog();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTag.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createTag.isPending || updateTag.isPending;

  return (
    <StandardManagementLayout
      title="Quản lý Tags"
      icon={TagIcon}
      isLoading={isLoading}
      isEmpty={tags.length === 0}
      actionButton={{
        label: "Thêm Tag",
        onClick: () => handleOpenDialog(),
        icon: Plus,
      }}
      emptyState={{
        icon: TagIcon,
        title: "Chưa có tag nào",
        description: "Tạo tag đầu tiên để phân loại bài học.",
        actionButton: {
          label: "Thêm Tag Đầu Tiên",
          onClick: () => handleOpenDialog(),
          icon: Plus,
        },
      }}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Tag</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(tag)}
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
                            Bạn có chắc chắn muốn xóa tag "{tag.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tag.id)}
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
              {editingTag ? "Sửa Tag" : "Thêm Tag Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Thay đổi tên của tag."
                : "Tạo tag mới để phân loại bài học."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="tag-name">Tên Tag</Label>
            <Input
              id="tag-name"
              placeholder="Nhập tên tag..."
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
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

export default TagManagement;