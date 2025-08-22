import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateEduExercise } from "@/hooks/useEduExercises";
import VideoUpload from "@/components/VideoUpload";
import { useUpload } from "@/contexts/UploadContext";

interface CreateExerciseDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateExerciseDialog: React.FC<CreateExerciseDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    is_required: true,
    min_review_videos: 0,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const createExercise = useCreateEduExercise();
  const { addUpload } = useUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExercise = await createExercise.mutateAsync({
      ...formData,
      exercise_video_url: "",
    });

    if (videoFile && newExercise) {
      addUpload(videoFile, newExercise.id, 'edu_exercise');
    }

    onClose();
    setFormData({
      title: "",
      is_required: true,
      min_review_videos: 0,
    });
    setVideoFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm bài học mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên bài học *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tên bài học"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise_video_url">Video bài học</Label>
            <VideoUpload
              onFileSelected={setVideoFile}
              currentVideoUrl={videoFile ? URL.createObjectURL(videoFile) : ""}
              disabled={createExercise.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_review_videos">Video ôn tập</Label>
              <Input
                id="min_review_videos"
                type="number"
                min="0"
                value={formData.min_review_videos}
                onChange={(e) => setFormData(prev => ({ ...prev, min_review_videos: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_required">Bắt buộc</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
              />
              <Label htmlFor="is_required" className="text-sm">
                {formData.is_required ? "Bắt buộc" : "Không bắt buộc"}
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createExercise.isPending}>
              {createExercise.isPending ? "Đang tạo..." : "Tạo bài học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseDialog;