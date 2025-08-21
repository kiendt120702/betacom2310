
import React from "react";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 md:gap-4 ${isUser ? "justify-end" : "justify-start"} max-w-full`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
      )}
      
      <Card className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 break-words overflow-hidden ${
        isUser 
          ? "bg-primary text-primary-foreground ml-auto" 
          : "bg-muted/50"
      }`}>
        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words overflow-wrap-anywhere">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words m-0">{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 pl-4 break-words">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 pl-4 break-words">{children}</ol>,
                li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm break-all">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                      <code className="text-sm break-all whitespace-pre-wrap">
                        {children}
                      </code>
                    </pre>
                  );
                },
                h1: ({ children }) => <h1 className="text-lg md:text-xl font-bold mb-2 break-words">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base md:text-lg font-bold mb-2 break-words">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm md:text-base font-bold mb-2 break-words">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 my-2 italic break-words">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full border-collapse border border-muted">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-muted px-2 py-1 bg-muted/50 font-semibold text-left break-words">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-muted px-2 py-1 break-words">
                    {children}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </Card>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
