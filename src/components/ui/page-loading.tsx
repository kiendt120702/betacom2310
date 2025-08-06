
import React from "react";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  message?: string;
  className?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message,
  className 
}) => {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-[60vh] w-full",
      className
    )}>
      <div className="flex flex-col items-center space-y-6">
        <LoadingSpinner size="xl" />
        
        {message && (
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { PageLoading };
