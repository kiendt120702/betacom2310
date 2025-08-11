
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import ImageUploadButton from "./ImageUploadButton";
import ImagePreview from "./ImagePreview";

interface ChatInputProps {
  onSubmit: (message: string, image?: File) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    // Allow submission if there's either text or an image
    if ((!trimmedMessage && !selectedImage) || isLoading) return;
    
    onSubmit(trimmedMessage || "Hãy phân tích hình ảnh này", selectedImage || undefined);
    setMessage("");
    setSelectedImage(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, selectedImage, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
  }, []);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const canSubmit = (message.trim() || selectedImage) && !isLoading;

  return (
    <div className="space-y-3">
      {selectedImage && (
        <div className="px-1">
          <ImagePreview file={selectedImage} onRemove={handleImageRemove} />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedImage ? "Tùy chọn: Thêm câu hỏi về hình ảnh..." : "Hỏi bất kỳ điều gì..."}
          className="pr-20 resize-none min-h-[40px] max-h-[120px] transition-all duration-200"
          rows={1}
          disabled={isLoading}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <ImageUploadButton
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onImageRemove={handleImageRemove}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!canSubmit}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
