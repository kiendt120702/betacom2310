import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateEduExercise } from "@/hooks/useEduExercises";
import { TrainingExercise } from "@/types/training";
import VideoUpload from "@/components/VideoUpload";
import { useUnifiedVideoUpload } from "@/hooks/useUnifiedVideoUpload";
import { useToast } from "@/hooks/use-toast";

interface EditExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: TrainingExercise;
}

const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({ open, onClose, exercise }) => {
  const [formData, setFormData] = useState({
    title: "",
    is_required: true,
    min_review_videos: 0,
    required_viewing_count: 1,
    is_checkpoint: false,
    has_video: true,
    has_theory_test: true,
    has_practice_test: true,
    has_review_video: true,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const updateExercise = useUpdateEduExercise();
  const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || "",
        is_required: exercise.is_required || true,
        min_review_videos: exercise.min_review_videos || 0,
        required_viewing_count: exercise.required_viewing_count || 1,
        is_checkpoint: exercise.is_checkpoint || false,
        has_video: exercise.has_video,
        has_theory_test: exercise.has_theory_test,
        has_practice_test: exercise.has_practice_test,
        has_review_video: exercise.has_review_video,
      });
      setCurrentVideoUrl(exercise.exercise_video_url || "");
      setVideoFile(null);
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let videoUrl = exercise.exercise_video_url;

    if (formData.has_video && videoFile) {
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
      exerciseId: exercise.id,
      ...formData,
      exercise_video_url: videoUrl || undefined,
    });
    
    onClose();
  };

  const handleFileSelected = (file: File | null) => {
    setVideoFile(file);
    if (file) {
      setCurrentVideoUrl(URL.createObjectURL(file));
    } else {
      setCurrentVideoUrl(exercise.exercise_video_url || "");
    }
  };

  const isSubmitting = uploading || updateExercise.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài tập kiến thức</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên bài tập *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tên bài tập"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 p-3 border rounded-md">
            <Label>Các thành phần của bài học</Label>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch id="has_video" checked={formData.has_video} onCheckedChange={(c) => setFormData(p => ({...p, has_video: c}))} />
                <Label htmlFor="has_video">Có video</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="has_theory_test" checked={formData.has_theory_test} onCheckedChange={(c) => setFormData(p => ({...p, has_theory_test: c}))} />
                <Label htmlFor="has_theory_test">Có test lý thuyết</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="has_practice_test" checked={formData.has_practice_test} onCheckedChange={(c) => setFormData(p => ({...p, has_practice_test: c}))} />
                <Label htmlFor="has_practice_test">Có test thực hành</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="has_review_video" checked={formData.has_review_video} onCheckedChange={(c) => setFormData(p => ({...p, has_review_video: c}))} />
                <Label htmlFor="has_review_video">Có video ôn tập</Label>
              </div>
            </div>
          </div>

          {formData.has_video && (
            <div className="space-y-2">
              <Label htmlFor="exercise_video_url">Video bài học</Label>
              <VideoUpload
                onFileSelected={handleFileSelected}
                currentVideoUrl={currentVideoUrl}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {formData.has_video && (
              <div className="space-y-2">
                <Label htmlFor="required_viewing_count">Số lần xem YC</Label>
                <Input
                  id="required_viewing_count"
                  type="number"
                  min="1"
                  value={formData.required_viewing_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, required_viewing_count: parseInt(e.target.value) || 1 }))}
                  disabled={isSubmitting}
                />
              </div>
            )}
            {formData.has_review_video && (
              <div className="space-y-2">
                <Label htmlFor="min_review_videos">Video ôn tập</Label>
                <Input
                  id="min_review_videos"
                  type="number"
                  min="0"
                  value={formData.min_review_videos}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_review_videos: parseInt(e.target.value) || 0 }))}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="is_required">Bắt buộc</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_required" className="text-sm">
                  {formData.is_required ? "Bắt buộc" : "Không bắt buộc"}
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_checkpoint">Checkpoint</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="is_checkpoint"
                  checked={formData.is_checkpoint}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_checkpoint: checked }))}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_checkpoint" className="text-sm">
                  {formData.is_checkpoint ? "Là Checkpoint" : "Không"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExerciseDialog;