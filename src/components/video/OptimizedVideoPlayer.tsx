import React, { useRef, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import { useVideoQuality } from '@/hooks/useVideoQuality';
import VideoControls from './VideoControls';
import VideoOverlays from './VideoOverlays';
import QualityChangeIndicator from './QualityChangeIndicator';

interface OptimizedVideoPlayerProps {
  videoUrl: string;
  title: string;
  isCompleted?: boolean;
  onVideoComplete: () => void;
  onProgress?: (progress: number) => void;
  onSaveTimeSpent: (seconds: number) => void;
  autoPlay?: boolean;
  thumbnail?: string;
  mode?: 'training' | 'preview';
}

const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  videoUrl,
  title,
  isCompleted = false,
  onVideoComplete,
  onProgress,
  onSaveTimeSpent,
  autoPlay = false,
  thumbnail,
  mode = 'training',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showQualityIndicator, setShowQualityIndicator] = useState(false);
  const [qualityChangeInfo, setQualityChangeInfo] = useState<any>(null);

  const playerState = useVideoPlayerState({
    videoRef,
    isCompleted,
    onVideoComplete,
    onProgress,
    onSaveTimeSpent,
    mode,
  });

  const {
    currentQuality,
    availableQualities,
    isAutoMode,
    switchQuality,
  } = useVideoQuality(videoRef.current);

  const handleQualityChange = useCallback((quality) => {
    setQualityChangeInfo(quality);
    setShowQualityIndicator(true);
  }, []);

  const handleRetry = () => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <>
      <style>{`
        .slider::-webkit-slider-thumb { appearance: none; height: 12px; width: 12px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 0 2px rgba(0,0,0,0.5); }
        .slider::-moz-range-thumb { height: 12px; width: 12px; border-radius: 50%; background: white; cursor: pointer; border: none; box-shadow: 0 0 2px rgba(0,0,0,0.5); }
      `}</style>
      
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm md:text-base font-semibold">Video hướng dẫn</h3>
          {isCompleted && (
            <Badge variant="default" className="bg-green-600 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đã hoàn thành
            </Badge>
          )}
        </div>

        {/* Time tracker */}
        {mode === 'training' && (
          <div className="mb-4 flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-md">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-base text-muted-foreground">
              Thời gian xem trong phiên hiện tại: <span className="font-bold text-lg text-primary">{playerState.formatTime(playerState.elapsedTime)}</span>
            </p>
          </div>
        )}

        <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden group w-full">
          <VideoOverlays
            isLoading={playerState.isLoading}
            isBuffering={playerState.isBuffering}
            error={playerState.error}
            loadingProgress={playerState.loadingProgress}
            onRetry={handleRetry}
            isPlaying={playerState.isPlaying}
            onTogglePlay={playerState.togglePlayPause}
          />

          {qualityChangeInfo && (
            <QualityChangeIndicator
              quality={qualityChangeInfo}
              isVisible={showQualityIndicator}
              onHide={() => setShowQualityIndicator(false)}
            />
          )}

          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail}
            className="w-full h-full object-contain"
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            {...playerState.eventHandlers}
            autoPlay={autoPlay}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          />
          
          {playerState.videoLoaded && (
            <VideoControls
              {...playerState}
              availableQualities={availableQualities}
              currentQuality={currentQuality}
              isAutoMode={isAutoMode}
              switchQuality={switchQuality}
              handleQualityChange={handleQualityChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default OptimizedVideoPlayer;