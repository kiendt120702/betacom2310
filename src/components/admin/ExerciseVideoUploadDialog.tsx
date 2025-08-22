import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import VideoUpload from "@/components/VideoUpload";
import { useUpdateEduExercise } from "@/hooks/useEduExercises";
import { Upload, Video, Play } from "lucide-react";

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
  const [videoUrl, setVideoUrl] = useState("");
  const updateExercise = useUpdateEduExercise();

  useEffect(() => {
    if (open) {
      setVideoUrl(exercise.exercise_video_url || "");
    }
  }, [open, exercise.exercise_video_url]);

  const handleVideoUploadedAndSave = async (url: string) => {
    setVideoUrl(url); // Cập nhật UI để hiển thị video mới
    
    // Tự động lưu
    try {
      await updateExercise.mutateAsync({
        exerciseId: exercise.id,
        exercise_video_url: url || null,
      }, {
        onSuccess: () => {
          onSuccess?.();
          // Thông báo thành công đã được xử lý trong hook, không cần đóng dialog tự động
        }
      });
    } catch (error) {
      console.error("Error auto-updating exercise video:", error);
      // Thông báo lỗi đã được xử lý trong hook
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
                currentVideoUrl={videoUrl}
                onVideoUploaded={handleVideoUploadedAndSave}
                disabled={updateExercise.isPending}
              />
            </div>
          </div>

          {videoUrl && (
            <div className="space-y-2">
              <Label>Xem trước video</Label>
              <div className="border rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-40 bg-black"
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Trình duyệt không hỗ trợ video.
                </video>
              </div>
              <p className="text-xs text-muted-foreground">
                Video sẽ được bảo vệ khỏi download khi học viên xem
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateExercise.isPending}
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