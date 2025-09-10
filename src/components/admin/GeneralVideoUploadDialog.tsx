import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import VideoUpload from "@/components/VideoUpload";
import { Video } from "lucide-react";
import { useUnifiedVideoUpload } from "@/hooks/useUnifiedVideoUpload";
import { useUpdateGeneralTraining } from "@/hooks/useGeneralTraining";
import { useToast } from "@/hooks/use-toast";

interface GeneralVideoUploadDialogProps {
  exercise: {
    id: string;
    title: string;
    video_url?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const GeneralVideoUploadDialog: React.FC<GeneralVideoUploadDialogProps> = ({ 
  exercise, 
  open,
  onOpenChange,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();
  const updateGeneralTraining = useUpdateGeneralTraining();
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
      const result = await uploadVideo(selectedFile);
      
      if (result.error || !result.url) {
        console.error('Upload failed:', result.error);
        toast({
          title: "Lỗi upload",
          description: result.error || "Không thể upload video. Vui lòng thử lại.",
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      console.log('Upload successful, updating general training with URL:', result.url);
      await updateGeneralTraining.mutateAsync({
        id: exercise.id,
        video_url: result.url,
      });

      console.log('General training updated successfully');
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

  const isProcessing = uploading || updateGeneralTraining.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video bài học chung
          </DialogTitle>
          <DialogDescription>
            Upload hoặc thay đổi video cho bài học chung: <strong>{exercise.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="video-upload">Video bài học</Label>
            <div className="mt-2">
              <VideoUpload
                selectedFile={selectedFile}
                currentVideoUrl={!selectedFile ? exercise.video_url || undefined : undefined}
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
              {uploading ? "Đang tải lên..." : updateGeneralTraining.isPending ? "Đang lưu..." : "Lưu Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralVideoUploadDialog;