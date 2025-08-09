
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTrainingCourse, TrainingCourse } from "@/hooks/useTrainingCourses";

interface EditCourseDialogProps {
  open: boolean;
  onClose: () => void;
  course: TrainingCourse;
}

const EditCourseDialog: React.FC<EditCourseDialogProps> = ({ open, onClose, course }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    min_study_sessions: 1,
    min_review_videos: 0,
  });
  const updateCourseMutation = useUpdateTrainingCourse();

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        min_study_sessions: course.min_study_sessions || 1,
        min_review_videos: course.min_review_videos || 0,
      });
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseMutation.mutate(
      {
        id: course.id,
        ...formData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên khóa học *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tên khóa học"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả khóa học"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_study_sessions">Số lần học tối thiểu</Label>
              <Input
                id="min_study_sessions"
                type="number"
                min="1"
                value={formData.min_study_sessions}
                onChange={(e) => setFormData(prev => ({ ...prev, min_study_sessions: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_review_videos">Số video ôn tập</Label>
              <Input
                id="min_review_videos"
                type="number"
                min="0"
                value={formData.min_review_videos}
                onChange={(e) => setFormData(prev => ({ ...prev, min_review_videos: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateCourseMutation.isPending}>
              {updateCourseMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
