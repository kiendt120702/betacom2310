import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { validateUrl } from "@/lib/utils";
import { useSubmitVideoReview, VideoReviewSubmission } from "@/hooks/useVideoReviewSubmissions";

interface VideoSubmissionDialogProps {
  children?: React.ReactNode; // Make children optional as it might be triggered by state
  exerciseId: string;
  exerciseTitle: string;
  initialSubmission?: VideoReviewSubmission; // New prop for editing
  onSubmissionSuccess?: () => void; // Callback for success
  open: boolean; // Control open state from parent
  onOpenChange: (open: boolean) => void; // Control open state from parent
}

const VideoSubmissionDialog: React.FC<VideoSubmissionDialogProps> = ({
  children,
  exerciseId,
  exerciseTitle,
  initialSubmission,
  onSubmissionSuccess,
  open,
  onOpenChange,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const submitVideoReview = useSubmitVideoReview();
  const { toast } = useToast();

  // Effect to set initial form data when in edit mode or clear on close
  useEffect(() => {
    if (open) {
      setVideoUrl(initialSubmission?.video_url || "");
    } else {
      setVideoUrl(""); // Clear on close
    }
  }, [open, initialSubmission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập link video",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(videoUrl.trim())) {
      toast({
        title: "Lỗi",
        description: "Link video không hợp lệ. Vui lòng nhập đúng định dạng URL (ví dụ: https://example.com/video.mp4).",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitVideoReview.mutateAsync({
        id: initialSubmission?.id, // Pass ID if in edit mode
        exercise_id: exerciseId,
        video_url: videoUrl.trim(),
        content: "Video ôn tập", // Default content
      });

      onOpenChange(false); // Close dialog on success
      onSubmissionSuccess?.(); // Call success callback
    } catch (error) {
      // Error handled by useSubmitVideoReview hook
    }
  };

  const dialogTitle = initialSubmission ? "Sửa video ôn tập" : "Nộp video ôn tập";
  const submitButtonText = submitVideoReview.isPending ? "Đang xử lý..." : (initialSubmission ? "Cập nhật video" : "Nộp video");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle} - {exerciseTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">Link video <span className="text-red-500">*</span></Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/your-video.mp4"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitVideoReview.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitVideoReview.isPending}>
              {submitVideoReview.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {submitButtonText}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {submitButtonText}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoSubmissionDialog;