
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLogo?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "lg", 
  className,
  showLogo = true 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  const logoSizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12", 
    xl: "w-16 h-16"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Spinning border */}
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-muted border-t-primary",
          sizeClasses[size]
        )}
      />
      
      {/* Logo in center - hiển thị rõ ràng */}
      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
            alt="Betacom Logo"
            className={cn(
              "object-contain",
              logoSizeClasses[size]
            )}
          />
        </div>
      )}
    </div>
  );
};

export { LoadingSpinner };
