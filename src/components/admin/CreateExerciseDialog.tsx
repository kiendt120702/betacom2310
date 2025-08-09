import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCreateEduExercise } from "@/hooks/useEduExercises";
import { supabase } from "@/integrations/supabase/client";

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const createExercise = useCreateEduExercise();

  const handleVideoUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `exercise-videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        onUploadProgress: (progress) => {
          setUploadProgress((progress.loaded / progress.total) * 100);
        },
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let videoUrl = formData.exercise_video_url;
      
      if (videoFile) {
        videoUrl = await handleVideoUpload(videoFile);
      }

      await createExercise.mutateAsync({
        ...formData,
        exercise_video_url: videoUrl,
      });
      
      onClose();
      setFormData({
        title: "",
        is_required: true,
        exercise_video_url: "",
      });
      setVideoFile(null);
      setUploadProgress(0);
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
            <div className="space-y-2">
              <Input
                id="exercise_video_url"
                type="url"
                value={formData.exercise_video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, exercise_video_url: e.target.value }))}
                placeholder="Nhập URL video hoặc upload file bên dưới"
              />
              <div className="text-center text-muted-foreground text-sm">hoặc</div>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setVideoFile(file);
                    setFormData(prev => ({ ...prev, exercise_video_url: "" }));
                  }
                }}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-sm text-center mt-1">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}
              {videoFile && (
                <p className="text-sm text-muted-foreground">
                  File đã chọn: {videoFile.name}
                </p>
              )}
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
              {loading ? "Đang tạo..." : "Tạo bài tập"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseDialog;
