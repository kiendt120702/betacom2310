import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Send, Loader2, X } from "lucide-react";
import { useCreateFeedback } from "@/hooks/useFeedback";
import { useImageUpload } from "@/hooks/useImageUpload";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onOpenChange }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const createFeedback = useCreateFeedback();
  const { uploadImage, uploading: isImageUploading } = useImageUpload();

  const isSubmitting = createFeedback.isPending || isImageUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (document.getElementById('feedback-image-upload')) {
      (document.getElementById('feedback-image-upload') as HTMLInputElement).value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    let imageUrl: string | null = null;
    if (imageFile) {
      const { url, error } = await uploadImage(imageFile);
      if (error) {
        return;
      }
      imageUrl = url;
    }

    createFeedback.mutate(
      {
        content: content.trim(),
        image_url: imageUrl,
      },
      {
        onSuccess: () => {
          setContent("");
          handleRemoveImage();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi góp ý / Báo lỗi</DialogTitle>
          <DialogDescription>
            Giúp chúng tôi cải thiện bằng cách gửi góp ý hoặc báo cáo lỗi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-content">Nội dung góp ý</Label>
            <Textarea
              id="feedback-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả góp ý hoặc lỗi bạn gặp phải..."
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-image-upload">Đính kèm ảnh (tùy chọn)</Label>
            {imagePreviewUrl ? (
              <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="feedback-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('feedback-image-upload')?.click()}
                  disabled={isSubmitting}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Chọn ảnh
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || (!content.trim() && !imageFile)}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi góp ý
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;