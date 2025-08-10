
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";

interface WorkType {
  id: string;
  value: string;
  label: string;
  description: string;
}

const WorkTypeManagement: React.FC = () => {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([
    { 
      id: "1", 
      value: "fulltime", 
      label: "fulltime", 
      description: "" 
    },
    { 
      id: "2", 
      value: "parttime", 
      label: "parttime", 
      description: "" 
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null);
  const [formData, setFormData] = useState({ value: "", label: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (workType: WorkType | null = null) => {
    setEditingWorkType(workType);
    setFormData({
      value: workType ? workType.value : "",
      label: workType ? workType.label : "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkType(null);
    setFormData({ value: "", label: "", description: "" });
  };

  const handleSubmit = async () => {
    if (!formData.label.trim()) return;

    setIsSubmitting(true);
    
    try {
      const workTypeData = {
        value: formData.label, // Use label as value
        label: formData.label,
        description: "",
      };

      if (editingWorkType) {
        // Update existing work type
        setWorkTypes(prev => prev.map(wt => 
          wt.id === editingWorkType.id 
            ? { ...wt, ...workTypeData }
            : wt
        ));
      } else {
        // Add new work type
        const newWorkType: WorkType = {
          id: Date.now().toString(),
          ...workTypeData,
        };
        setWorkTypes(prev => [...prev, newWorkType]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving work type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setWorkTypes(prev => prev.filter(wt => wt.id !== id));
    } catch (error) {
      console.error("Error deleting work type:", error);
    }
  };

  return (
    <StandardManagementLayout
      title="Quản lý hình thức làm việc"
      icon={Clock}
      isEmpty={workTypes.length === 0}
      actionButton={{
        label: "Thêm hình thức",
        onClick: () => handleOpenDialog(),
        icon: Plus,
      }}
      emptyState={{
        icon: Clock,
        title: "Chưa có hình thức làm việc nào",
        description: "Tạo hình thức làm việc đầu tiên để cấu hình các loại hình làm việc.",
        actionButton: {
          label: "Thêm hình thức đầu tiên",
          onClick: () => handleOpenDialog(),
          icon: Plus,
        },
      }}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes.map((workType) => (
              <TableRow key={workType.id}>
                <TableCell className="font-medium">{workType.label}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(workType)}
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
                            Bạn có chắc chắn muốn xóa hình thức làm việc "{workType.label}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(workType.id)}
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
              {editingWorkType ? "Sửa hình thức làm việc" : "Thêm hình thức làm việc mới"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkType
                ? "Chỉnh sửa thông tin hình thức làm việc."
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Tên hiển thị</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value, value: e.target.value }))
                }
                placeholder="Nhập tên hiển thị (fulltime hoặc parttime)..."
              />
            </div>
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

export default WorkTypeManagement;
