
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCreateEduExercise } from "@/hooks/useEduExercises";
import VideoUpload from "@/components/VideoUpload";

interface CreateExerciseDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateExerciseDialog: React.FC<CreateExerciseDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    is_required: true,
    exercise_video_url: "",
  });
  const [loading, setLoading] = useState(false);
  const createExercise = useCreateEduExercise();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createExercise.mutateAsync({
        ...formData,
      });
      
      onClose();
      setFormData({
        title: "",
        is_required: true,
        exercise_video_url: "",
      });
    } catch (error) {
      console.error("Create exercise error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo bài tập kiến thức mới</DialogTitle>
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
              {loading ? "Đang tạo..." : "Tạo bài tập"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseDialog;
