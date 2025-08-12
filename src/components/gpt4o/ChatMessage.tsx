import React, { memo } from "react";
import { Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import LazyImage from "@/components/LazyImage";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  image_urls?: string[];
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({ role, content, image_urls }) => {
  const isUser = role === "user";
  const isError = content.includes("❌") || content.includes("⚠️");
  const isEmpty = !content || content.trim() === "";

  return (
    <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "")}>
      {!isUser && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isError 
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground"
        )}>
          {isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
      )}
      <div
        className={cn(
          "max-w-xl p-4 rounded-lg prose dark:prose-invert",
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
            ? "bg-destructive/10 border border-destructive/20 text-destructive-foreground"
            : isEmpty
            ? "bg-muted border-2 border-dashed border-muted-foreground/30"
            : "bg-muted"
        )}
      >
        {image_urls && image_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {image_urls.map((url, index) => (
              <div key={index} className="w-32 h-32 rounded-md overflow-hidden">
                <LazyImage
                  src={url}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        {isEmpty ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            <span className="ml-2 text-sm">AI đang suy nghĩ...</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">{content}</div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;