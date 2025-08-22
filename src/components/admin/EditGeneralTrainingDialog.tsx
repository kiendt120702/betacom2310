import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGeneralTraining, GeneralTrainingExercise } from "@/hooks/useGeneralTraining";

interface EditGeneralTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: GeneralTrainingExercise;
}

const EditGeneralTrainingDialog: React.FC<EditGeneralTrainingDialogProps> = ({ open, onClose, exercise }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    video_url: "",
  });
  const updateExercise = useUpdateGeneralTraining();

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || "",
        description: exercise.description || "",
        content: exercise.content || "",
        video_url: exercise.video_url || "",
      });
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateExercise.mutateAsync({ id: exercise.id, ...formData }, {
      onSuccess: onClose,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài học chung</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên bài học *</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={updateExercise.isPending}>
              {updateExercise.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGeneralTrainingDialog;