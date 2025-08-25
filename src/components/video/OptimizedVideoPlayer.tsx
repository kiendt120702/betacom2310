import React, { useRef, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
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

        <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden group w-full">
          <VideoOverlays
            isLoading={playerState.isLoading}
            isBuffering={playerState.isBuffering}
            error={playerState.error}
            loadingProgress={playerState.loadingProgress}
            onRetry={handleRetry}
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