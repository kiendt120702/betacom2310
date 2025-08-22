import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import VideoUpload from "@/components/VideoUpload";
import { Video } from "lucide-react";
import { useLargeVideoUpload } from "@/hooks/useLargeVideoUpload";
import { useUpdateExerciseVideo } from "@/hooks/useEduExercises";
import { useToast } from "@/hooks/use-toast";

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { uploadVideo, uploading } = useLargeVideoUpload();
  const updateExerciseVideo = useUpdateExerciseVideo();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!videoFile) {
      toast({ title: "Lỗi", description: "Vui lòng chọn một file video.", variant: "destructive" });
      return;
    }

    const result = await uploadVideo(videoFile);
    if (result.error || !result.url) {
      toast({ title: "Lỗi upload video", description: result.error || "Không thể lấy URL video.", variant: "destructive" });
      return;
    }

    await updateExerciseVideo.mutateAsync({
      exerciseId: exercise.id,
      videoUrl: result.url,
    });

    onSuccess?.();
    onOpenChange(false);
  };

  const isSubmitting = uploading || updateExerciseVideo.isPending;

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
                currentVideoUrl={videoFile ? URL.createObjectURL(videoFile) : exercise.exercise_video_url || ""}
                onFileSelected={setVideoFile}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Đóng
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={isSubmitting || !videoFile}
            >
              {isSubmitting ? "Đang tải lên..." : "Lưu Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseVideoUploadDialog;