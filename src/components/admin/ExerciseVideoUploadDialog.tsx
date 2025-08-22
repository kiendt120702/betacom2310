import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import VideoUpload from "@/components/VideoUpload";
import { Video } from "lucide-react";
import { useUpload } from "@/contexts/UploadContext";

interface ExerciseVideoUploadDialogProps {
  exercise: {
    id: string;
    title: string;
    exercise_video_url?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ExerciseVideoUploadDialog: React.FC<ExerciseVideoUploadDialogProps> = ({ 
  exercise, 
  open,
  onOpenChange,
  onSuccess
}) => {
  const { addUpload } = useUpload();

  const handleFileSelected = (file: File | null) => {
    if (file) {
      addUpload(file, exercise.id, 'edu_exercise');
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video bài tập
          </DialogTitle>
          <DialogDescription>
            Upload hoặc thay đổi video cho bài tập: <strong>{exercise.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="video-upload">Video bài học</Label>
            <div className="mt-2">
              <VideoUpload
                currentVideoUrl={exercise.exercise_video_url || ""}
                onFileSelected={handleFileSelected}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseVideoUploadDialog;