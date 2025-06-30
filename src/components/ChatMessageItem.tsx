import React from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  botType: "strategy" | "seo";
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, botType }) => {
  const botColor = botType === "strategy" ? "bg-blue-600" : "bg-green-600";
  const userColor = botType === "strategy" ? "bg-blue-500" : "bg-green-500";

  return (
    <div
      key={message.id}
      className={cn(
        "flex gap-3",
        message.type === "user" ? "justify-end" : "justify-start"
      )}>
      {message.type === "bot" && (
        <div className={cn(`w-8 h-8 rounded-full ${botColor} flex items-center justify-center flex-shrink-0 shadow-sm`)}>
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[70%] rounded-2xl p-3 shadow-sm",
          message.type === "user"
            ? `${userColor} text-white`
            : "bg-white text-gray-900 border border-gray-100"
        )}>
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            <span className="text-gray-600 text-sm">
              {botType === "strategy" 
                ? "Đang phân tích và tìm kiếm chiến lược phù hợp..."
                : "Đang phân tích và tìm kiếm kiến thức SEO phù hợp..."
              }
            </span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed text-sm">
            {message.content}
          </div>
        )}
        <div
          className={cn(
            "text-xs mt-2",
            message.type === "user"
              ? "text-white/70"
              : "text-gray-500"
          )}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>

      {message.type === "user" && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageItem;