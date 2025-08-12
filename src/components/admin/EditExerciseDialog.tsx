import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TrainingExercise } from "@/types/training"; // Corrected import
import VideoUpload from "@/components/VideoUpload";

interface EditExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: TrainingExercise; // Corrected type
}

const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({ open, onClose, exercise }) => {
  const [formData, setFormData] = useState({
    title: "",
    is_required: true,
    exercise_video_url: "",
    min_study_sessions: 1,
    min_review_videos: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || "",
        is_required: exercise.is_required || true,
        exercise_video_url: exercise.exercise_video_url || "",
        min_study_sessions: exercise.min_study_sessions || 1,
        min_review_videos: exercise.min_review_videos || 0,
      });
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("edu_knowledge_exercises")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", exercise.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Bài tập kiến thức đã được cập nhật thành công",
      });

      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      onClose();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài tập kiến thức",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise_video_url">Video bài học</Label>
            <VideoUpload
              onVideoUploaded={(url) => setFormData(prev => ({ ...prev, exercise_video_url: url }))}
              currentVideoUrl={formData.exercise_video_url}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_study_sessions">Yêu cầu học</Label>
              <Input
                id="min_study_sessions"
                type="number"
                min="1"
                value={formData.min_study_sessions}
                onChange={(e) => setFormData(prev => ({ ...prev, min_study_sessions: parseInt(e.target.value) || 1 }))}
              />
            </div>

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
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExerciseDialog;