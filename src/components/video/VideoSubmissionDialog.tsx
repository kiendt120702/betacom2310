
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitVideoReview } from "@/hooks/useVideoReviewSubmissions";
import { Upload } from "lucide-react";

interface VideoSubmissionDialogProps {
  exerciseId: string;
  exerciseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const VideoSubmissionDialog = ({ 
  exerciseId, 
  exerciseTitle, 
  open, 
  onOpenChange 
}: VideoSubmissionDialogProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  
  const submitVideoReview = useSubmitVideoReview();

  const handleSubmit = () => {
    if (!videoUrl.trim()) return;

    submitVideoReview.mutate({
      exercise_id: exerciseId,
      video_url: videoUrl,
      content: content || undefined,
    }, {
      onSuccess: () => {
        setVideoUrl("");
        setContent("");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nộp video ôn tập</DialogTitle>
          <DialogDescription>
            Nộp video ôn tập cho bài tập: {exerciseTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-url">Link video *</Label>
            <Input
              id="video-url"
              type="url"
              placeholder="Nhập link video YouTube, Google Drive, v.v..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="content">Mô tả (tùy chọn)</Label>
            <Textarea
              id="content"
              placeholder="Mô tả nội dung video..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!videoUrl.trim() || submitVideoReview.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {submitVideoReview.isPending ? "Đang nộp..." : "Nộp video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoSubmissionDialog;
