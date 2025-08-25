import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface VideoOverlaysProps {
  isLoading: boolean;
  isBuffering: boolean;
  error: string | null;
  loadingProgress: number;
  onRetry: () => void;
}

const VideoOverlays: React.FC<VideoOverlaysProps> = ({ isLoading, isBuffering, error, loadingProgress, onRetry }) => {
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Đang tải video...</p>
            <div className="w-48 bg-muted-foreground/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{loadingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <div className="text-center space-y-4 p-4">
          <div className="text-destructive text-4xl">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (isBuffering) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <div className="text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-white" />
          <p className="text-xs text-white">Đang buffer...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default VideoOverlays;