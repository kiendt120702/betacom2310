import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateSpecialistTraining, SpecialistTrainingExercise } from "@/hooks/useSpecialistTraining";
import VideoUpload from "@/components/VideoUpload";
import { useUnifiedVideoUpload } from "@/hooks/useUnifiedVideoUpload";
import { useToast } from "@/hooks/use-toast";

interface EditSpecialistTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: SpecialistTrainingExercise;
}

const EditSpecialistTrainingDialog: React.FC<EditSpecialistTrainingDialogProps> = ({ open, onClose, exercise }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    is_required: false,
    min_review_videos: 0,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const updateExercise = useUpdateSpecialistTraining();
  const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || "",
        description: exercise.description || "",
        content: exercise.content || "",
        is_required: exercise.is_required || false,
        min_review_videos: exercise.min_review_videos || 0,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài tập Chuyên viên</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên bài tập *</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
              required 
              disabled={isSubmitting} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
              disabled={isSubmitting} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">Video bài tập</Label>
            <VideoUpload
              onFileSelected={handleFileSelected}
              currentVideoUrl={currentVideoUrl}
              disabled={isSubmitting}
              uploading={uploading}
              uploadProgress={progress.percentage}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung lý thuyết</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Nhập nội dung lý thuyết..."
              rows={6}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_review_videos">Số video cần xem tối thiểu</Label>
              <Input
                id="min_review_videos"
                type="number"
                min="0"
                value={formData.min_review_videos}
                onChange={(e) => setFormData(prev => ({ ...prev, min_review_videos: parseInt(e.target.value) || 0 }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: !!checked }))}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_required" className="text-sm font-medium">
                Bài tập bắt buộc
              </Label>
            </div>
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

export default EditSpecialistTrainingDialog;