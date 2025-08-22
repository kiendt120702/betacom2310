import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTrainingCourse, TrainingCourse } from "@/hooks/useTrainingCourses";
import { Loader2 } from "lucide-react";

interface EditCourseDialogProps {
  open: boolean;
  onClose: () => void;
  course: TrainingCourse;
}

const EditCourseDialog: React.FC<EditCourseDialogProps> = ({ open, onClose, course }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const updateCourseMutation = useUpdateTrainingCourse();

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || "");
    }
  }, [course]);

  const handleSubmit = async () => {
    await updateCourseMutation.mutateAsync({ id: course.id, title, description }, {
      onSuccess: onClose
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Tên khóa học</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updateCourseMutation.isPending}>
            {updateCourseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;