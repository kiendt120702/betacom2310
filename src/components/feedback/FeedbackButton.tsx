import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useSubmitFeedback } from "@/hooks/useFeedback";
import { useAuth } from "@/hooks/useAuth";

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const submitFeedback = useSubmitFeedback();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    await submitFeedback.mutateAsync({
      content,
      image_url: imageUrl,
      page_url: window.location.href,
      user_id: user.id,
    });

    // Reset form and close dialog
    setContent("");
    setImageUrl(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg z-50"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gửi Feedback hoặc Báo lỗi</DialogTitle>
          <DialogDescription>
            Mô tả vấn đề bạn gặp phải hoặc góp ý để cải thiện hệ thống.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feedback-content">Nội dung</Label>
            <Textarea
              id="feedback-content"
              placeholder="Mô tả chi tiết ở đây..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="feedback-image">Ảnh chụp màn hình (tùy chọn)</Label>
            <ImageUpload
              onImageUploaded={(url) => setImageUrl(url)}
              currentImageUrl={imageUrl || undefined}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={!content.trim() || submitFeedback.isPending}
          >
            {submitFeedback.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;