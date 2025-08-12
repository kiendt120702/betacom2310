import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, X } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import LazyImage from "@/components/LazyImage";

interface ChatInputProps {
  onSubmit: (message: string, imageUrl?: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading: isUploadingImage } = useImageUpload();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && !imageUrl) || isLoading) return;
    
    onSubmit(trimmedMessage, imageUrl || undefined);
    setMessage("");
    setImageUrl(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, imageUrl, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { url, error } = await uploadImage(file);
      if (url) {
        setImageUrl(url);
      } else if (error) {
        toast.error("Lỗi tải ảnh lên", { description: error });
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      {imageUrl && (
        <div className="relative w-20 h-20 mb-2 rounded-md overflow-hidden border">
          <LazyImage src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleRemoveImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi bất kỳ điều gì hoặc tải ảnh lên..."
          className="pr-24 resize-none min-h-[40px] max-h-[120px] transition-all duration-200"
          rows={1}
          disabled={isLoading || isUploadingImage}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploadingImage || !!imageUrl}
          >
            {isUploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || isUploadingImage || (!message.trim() && !imageUrl)}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;