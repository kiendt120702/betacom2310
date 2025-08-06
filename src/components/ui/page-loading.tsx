
import React from "react";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  message?: string;
  className?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = "Đang tải...",
  className 
}) => {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-[60vh] w-full",
      className
    )}>
      <div className="flex flex-col items-center space-y-6">
        {/* Loading Spinner với logo */}
        <LoadingSpinner size="xl" />
        
        {/* Loading Text */}
        <div className="text-center space-y-3">
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            {message}
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PageLoading };
