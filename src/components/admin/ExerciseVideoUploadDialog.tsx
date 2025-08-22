
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import VideoUpload from "@/components/VideoUpload";
import { Video } from "lucide-react";
import { useOptimizedVideoUpload } from "@/hooks/useOptimizedVideoUpload";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadVideo, uploading, progress } = useOptimizedVideoUpload();
  const updateExerciseVideo = useUpdateExerciseVideo();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ 
        title: "Lỗi", 
        description: "Vui lòng chọn file video trước khi tải lên.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      console.log('Starting optimized video upload process...');
      const result = await uploadVideo(selectedFile);
      
      if (result.error || !result.url) {
        console.error('Upload failed:', result.error);
        return; // Error already handled by the hook
      }

      console.log('Upload successful, updating exercise with URL:', result.url);
      await updateExerciseVideo.mutateAsync({
        exerciseId: exercise.id,
        videoUrl: result.url,
      });

      console.log('Exercise updated successfully');
      setSelectedFile(null);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in upload process:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const isProcessing = uploading || updateExerciseVideo.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                selectedFile={selectedFile}
                currentVideoUrl={!selectedFile ? exercise.exercise_video_url || undefined : undefined}
                onFileSelected={setSelectedFile}
                disabled={isProcessing}
                uploading={uploading}
                uploadProgress={progress.percentage}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              {isProcessing ? "Đang xử lý..." : "Đóng"}
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={isProcessing || !selectedFile}
            >
              {uploading ? "Đang tải lên..." : updateExerciseVideo.isPending ? "Đang lưu..." : "Lưu Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseVideoUploadDialog;
