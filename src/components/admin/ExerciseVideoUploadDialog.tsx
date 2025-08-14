import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  children?: React.ReactNode;
}

const ExerciseVideoUploadDialog: React.FC<ExerciseVideoUploadDialogProps> = ({ 
  exercise, 
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(exercise.exercise_video_url || "");
  const updateExercise = useUpdateEduExercise();

  const handleSave = async () => {
    try {
      await updateExercise.mutateAsync({
        exerciseId: exercise.id,
        exercise_video_url: videoUrl || null,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating exercise video:", error);
    }
  };

  const handleVideoUploaded = (url: string) => {
    setVideoUrl(url);
  };

  const hasVideoChanged = videoUrl !== (exercise.exercise_video_url || "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        )}
      </DialogTrigger>
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
                onVideoUploaded={handleVideoUploaded}
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
              onClick={() => setOpen(false)}
              disabled={updateExercise.isPending}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasVideoChanged || updateExercise.isPending}
            >
              {updateExercise.isPending ? "Đang lưu..." : "Lưu video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseVideoUploadDialog;