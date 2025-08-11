import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link } from "lucide-react"; // Import Link icon
import { validateUrl } from "@/lib/utils"; // Import validateUrl

interface VideoSubmissionDialogProps {
  children: React.ReactNode;
  exerciseId: string;
  exerciseTitle: string;
}

const VideoSubmissionDialog: React.FC<VideoSubmissionDialogProps> = ({ 
  children, 
  exerciseId, 
  exerciseTitle 
}) => {
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(""); // Change to store URL string
  const [isSubmitting, setIsSubmitting] = useState(false); // Changed from isUploading
  const { toast } = useToast();

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

    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Save submission record directly with the URL
      const { error: insertError } = await supabase
        .from("exercise_review_submissions")
        .insert({
          user_id: user.user.id,
          exercise_id: exerciseId,
          video_url: videoUrl.trim(), // Use the URL directly
          content: "Video ôn tập", // Default content as notes are removed
        });

      if (insertError) throw insertError;

      toast({
        title: "Thành công",
        description: "Video đã được nộp thành công",
      });

      setOpen(false);
      setVideoUrl(""); // Clear the URL
    } catch (error) {
      console.error("Error submitting video:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi nộp video. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nộp video ôn tập - {exerciseTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">Link video <span className="text-red-500">*</span></Label>
            <Input
              id="video-url"
              type="url" // Change type to url
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/your-video.mp4" // Placeholder for URL
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang nộp...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Nộp video
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