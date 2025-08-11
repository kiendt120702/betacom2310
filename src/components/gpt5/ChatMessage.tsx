import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex items-start gap-4", isUser ? "justify-end" : "")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-xl p-4 rounded-lg prose dark:prose-invert",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;