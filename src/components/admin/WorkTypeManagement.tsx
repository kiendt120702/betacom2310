
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
      label: "Toàn thời gian", 
      description: "Làm việc 8 tiếng/ngày, 5 ngày/tuần" 
    },
    { 
      id: "2", 
      value: "parttime", 
      label: "Bán thời gian", 
      description: "Làm việc linh hoạt theo giờ" 
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
      description: workType ? workType.description : "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkType(null);
    setFormData({ value: "", label: "", description: "" });
  };

  const handleSubmit = async () => {
    if (!formData.label.trim() || !formData.value.trim()) return;

    setIsSubmitting(true);
    
    try {
      if (editingWorkType) {
        // Update existing work type
        setWorkTypes(prev => prev.map(wt => 
          wt.id === editingWorkType.id 
            ? { ...wt, ...formData }
            : wt
        ));
      } else {
        // Add new work type
        const newWorkType: WorkType = {
          id: Date.now().toString(),
          ...formData,
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Quản lý hình thức làm việc</h3>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm hình thức
        </Button>
      </div>

      {workTypes.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Chưa có hình thức làm việc nào</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Giá trị</TableHead>
                <TableHead>Tên hiển thị</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workTypes.map((workType) => (
                <TableRow key={workType.id}>
                  <TableCell className="font-mono text-sm">{workType.value}</TableCell>
                  <TableCell className="font-medium">{workType.label}</TableCell>
                  <TableCell>{workType.description}</TableCell>
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
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkType ? "Sửa hình thức làm việc" : "Thêm hình thức làm việc mới"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkType
                ? "Chỉnh sửa thông tin hình thức làm việc."
                : "Tạo một hình thức làm việc mới trong hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="value">Giá trị (value)</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="Nhập giá trị (ví dụ: fulltime, parttime)..."
              />
            </div>
            <div>
              <Label htmlFor="label">Tên hiển thị</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Nhập tên hiển thị..."
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Nhập mô tả hình thức làm việc..."
                rows={3}
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
    </div>
  );
};

export default WorkTypeManagement;
