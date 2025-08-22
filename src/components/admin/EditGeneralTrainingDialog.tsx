import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGeneralTraining, GeneralTrainingExercise } from "@/hooks/useGeneralTraining";
import VideoUpload from "@/components/VideoUpload";
import { useLargeVideoUpload } from "@/hooks/useLargeVideoUpload";
import { useToast } from "@/hooks/use-toast";

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
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const updateExercise = useUpdateGeneralTraining();
  const { uploadVideo, uploading } = useLargeVideoUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || "",
        description: exercise.description || "",
        content: exercise.content || "",
      });
      setCurrentVideoUrl(exercise.video_url || "");
      setVideoFile(null);
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let videoUrl = exercise.video_url;

    if (videoFile) {
      const result = await uploadVideo(videoFile);
      if (result.error || !result.url) {
        toast({
          title: "Lỗi upload video",
          description: result.error || "Không thể lấy URL video.",
          variant: "destructive",
        });
        return;
      }
      videoUrl = result.url;
    }

    await updateExercise.mutateAsync({ 
      id: exercise.id, 
      ...formData,
      video_url: videoUrl || undefined,
    });
    
    onClose();
  };

  const handleFileSelected = (file: File | null) => {
    setVideoFile(file);
    if (file) {
      setCurrentVideoUrl(URL.createObjectURL(file));
    } else {
      setCurrentVideoUrl(exercise.video_url || "");
    }
  };

  const isSubmitting = uploading || updateExercise.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài học chung</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên bài học *</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">Video bài học</Label>
            <VideoUpload
              onFileSelected={handleFileSelected}
              currentVideoUrl={currentVideoUrl}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGeneralTrainingDialog;