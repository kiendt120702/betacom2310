import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTrainingCourse } from "@/hooks/useTrainingCourses";
import { Loader2 } from "lucide-react";

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ open, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createCourseMutation = useCreateTrainingCourse();

  const handleSubmit = async () => {
    await createCourseMutation.mutateAsync({ title, description }, {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo khóa học mới</DialogTitle>
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
          <Button onClick={handleSubmit} disabled={createCourseMutation.isPending}>
            {createCourseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo khóa học
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;