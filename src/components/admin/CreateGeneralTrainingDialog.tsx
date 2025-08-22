import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGeneralTraining } from "@/hooks/useGeneralTraining";
import VideoUpload from "@/components/VideoUpload";

interface CreateGeneralTrainingDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateGeneralTrainingDialog: React.FC<CreateGeneralTrainingDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    video_url: "",
  });
  const createExercise = useCreateGeneralTraining();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExercise.mutateAsync(formData, {
      onSuccess: () => {
        onClose();
        setFormData({ title: "", description: "", content: "", video_url: "" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm bài học chung mới</DialogTitle>
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
          <div className="space-y-2">
            <Label htmlFor="video_url">Video bài học</Label>
            <VideoUpload
              onVideoUploaded={(url) => setFormData(prev => ({ ...prev, video_url: url }))}
              currentVideoUrl={formData.video_url}
              disabled={createExercise.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung lý thuyết</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Nhập nội dung lý thuyết..."
              rows={8}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={createExercise.isPending}>
              {createExercise.isPending ? "Đang tạo..." : "Tạo bài học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGeneralTrainingDialog;