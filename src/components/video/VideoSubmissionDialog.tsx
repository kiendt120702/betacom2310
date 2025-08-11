
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file video",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Upload video file
      const fileName = `${user.user.id}/${exerciseId}/${Date.now()}_${videoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("training-videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      // Save submission record
      const { error: insertError } = await supabase
        .from("exercise_review_submissions")
        .insert({
          user_id: user.user.id,
          exercise_id: exerciseId,
          video_url: fileName,
          content: notes || "Video ôn tập",
        });

      if (insertError) throw insertError;

      toast({
        title: "Thành công",
        description: "Video đã được nộp thành công",
      });

      setOpen(false);
      setVideoFile(null);
      setNotes("");
    } catch (error) {
      console.error("Error submitting video:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nộp video. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
            <Label htmlFor="video">File video <span className="text-red-500">*</span></Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú về video của bạn..."
              rows={3}
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
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tải lên...
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
