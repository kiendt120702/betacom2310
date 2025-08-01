import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  className, 
  text 
}) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

export const FullPageLoader = React.memo<{ text?: string }>(({ text = "Đang tải..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
});

FullPageLoader.displayName = "FullPageLoader";

export const InlineLoader = React.memo<{ text?: string }>(({ text = "Đang tải..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner text={text} />
    </div>
  );
});

InlineLoader.displayName = "InlineLoader";