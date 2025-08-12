import React, { memo } from "react";
import { Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@shared/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({ role, content }) => {
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