import React, { useCallback, useState, useRef, useEffect } from 'react';
import { CheckCircle, Play, Pause, Volume2, VolumeX, Maximize, FastForward, Clock, Rewind, Forward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import QualitySelector from './QualitySelector';
import QualityChangeIndicator from './QualityChangeIndicator';
import { useVideoQuality } from '@/hooks/useVideoQuality';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasWatchedToEnd, setHasWatchedToEnd] = useState(isCompleted);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Quality change indicator
  const [showQualityIndicator, setShowQualityIndicator] = useState(false);
  const [qualityChangeInfo, setQualityChangeInfo] = useState<any>(null);

  const maxWatchedTimeRef = useRef(0);
  const { toast } = useToast();
  const timeSpentRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef(0);

  // Video quality management
  const {
    currentQuality,
    availableQualities,
    detectedQuality,
    isAutoMode,
    switchQuality,
  } = useVideoQuality(videoRef.current);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Play failed:', err);
        toast({
          title: "Lỗi phát video",
          description: "Không thể phát video. Vui lòng thử lại.",
          variant: "destructive",
        });
      });
    }
  }, [isPlaying, toast]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  const togglePlaybackSpeed = useCallback(() => {
    if (!videoRef.current) return;
    const newRate = videoRef.current.playbackRate === 1 ? 1.25 : 1;
    videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
    toast({
      title: "Tốc độ phát",
      description: `Đã đổi tốc độ thành ${newRate}x`,
    });
  }, [toast]);

  // Enhanced loading handlers
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (isCompleted) {
        maxWatchedTimeRef.current = videoRef.current.duration;
      }
      setLoadingProgress(25);
    }
  }, [isCompleted]);

  const handleLoadedData = useCallback(() => {
    setLoadingProgress(50);
  }, []);

  const handleCanPlay = useCallback(() => {
    setLoadingProgress(75);
    setIsBuffering(false);
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    setIsLoading(false);
    setVideoLoaded(true);
    setLoadingProgress(100);
    setIsBuffering(false);
  }, []);

  // Handle quality change notifications
  const handleQualityChange = useCallback((quality) => {
    setQualityChangeInfo(quality);
    setShowQualityIndicator(true);
    
    toast({
      title: "Đã chuyển chất lượng",
      description: `Video hiện đang phát ở chất lượng ${quality.label}`,
      duration: 2000,
    });
  }, [toast]);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handlePlaying = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử lại.');
    toast({
      title: "Lỗi tải video",
      description: "Có lỗi xảy ra khi tải video. Vui lòng kiểm tra kết nối mạng.",
      variant: "destructive",
    });
  }, [toast]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    const progressPercent = (current / total) * 100;

    if (!isCompleted && !hasWatchedToEnd && current > maxWatchedTimeRef.current + 1) {
      videoRef.current.currentTime = maxWatchedTimeRef.current;
      toast({
        title: "Cảnh báo",
        description: "Vui lòng xem hết video, không được tua nhanh.",
        variant: "destructive",
      });
      return;
    }
    maxWatchedTimeRef.current = Math.max(maxWatchedTimeRef.current, current);

    setCurrentTime(current);
    setProgress(progressPercent);
    onProgress?.(progressPercent);

    if (progressPercent >= 90 && !hasWatchedToEnd) {
      setHasWatchedToEnd(true);
      onVideoComplete();
    }
  }, [onVideoComplete, onProgress, hasWatchedToEnd, toast, isCompleted]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      timeSpentRef.current += 1;
    }, 1000);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!hasWatchedToEnd) {
      setHasWatchedToEnd(true);
      onVideoComplete();
    }
  }, [onVideoComplete, hasWatchedToEnd]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (clickX / width) * 100;
    const newTime = (percentage / 100) * duration;

    if (!isCompleted && !hasWatchedToEnd && newTime > maxWatchedTimeRef.current) {
      toast({
        title: "Cảnh báo",
        description: "Bạn không thể tua đến đoạn chưa xem.",
        variant: "destructive",
      });
      return;
    }

    videoRef.current.currentTime = newTime;
    setProgress(percentage);
  }, [duration, toast, isCompleted, hasWatchedToEnd, videoLoaded]);

  const handleSeek = useCallback((seconds: number) => {
    if (!videoRef.current || !videoLoaded) return;
    const newTime = videoRef.current.currentTime + seconds;
    
    if (seconds > 0 && !isCompleted && !hasWatchedToEnd && newTime > maxWatchedTimeRef.current) {
      toast({
        title: "Cảnh báo",
        description: "Bạn không thể tua đến đoạn chưa xem.",
        variant: "destructive",
      });
      videoRef.current.currentTime = maxWatchedTimeRef.current;
      return;
    }
    
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
  }, [duration, toast, isCompleted, hasWatchedToEnd, videoLoaded]);

  // Effect for periodic saving of time spent
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const timeToSave = timeSpentRef.current - lastSavedTimeRef.current;
      if (timeToSave > 0) {
        onSaveTimeSpent(timeToSave);
        lastSavedTimeRef.current = timeSpentRef.current;
      }
    }, 10000); // Save every 10 seconds

    return () => {
      clearInterval(saveInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Save any remaining time on unmount
      const remainingTimeToSave = timeSpentRef.current - lastSavedTimeRef.current;
      if (remainingTimeToSave > 0) {
        onSaveTimeSpent(remainingTimeToSave);
      }
    };
  }, [onSaveTimeSpent]);

  return (
    <>
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
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
          {/* Loading skeleton */}
          {isLoading && (
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
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-4 p-4">
                <div className="text-destructive text-4xl">⚠️</div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    videoRef.current?.load();
                  }}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}

          {/* Buffering overlay */}
          {isBuffering && videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-white" />
                <p className="text-xs text-white">Đang buffer...</p>
              </div>
            </div>
          )}

          {/* Quality Change Indicator */}
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
            onLoadStart={handleLoadStart}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={handleLoadedData}
            onCanPlay={handleCanPlay}
            onCanPlayThrough={handleCanPlayThrough}
            onWaiting={handleWaiting}
            onPlaying={handlePlaying}
            onError={handleError}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            autoPlay={autoPlay}
            playsInline
          />
          
          {/* Custom video controls */}
          {videoLoaded && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Progress bar */}
              <div 
                className="w-full h-1 bg-white/30 rounded-full mb-2 md:mb-3 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="p-1 h-auto text-white hover:bg-white/20"
                    disabled={!videoLoaded}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <Play className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSeek(-10)}
                    className="p-1 h-auto text-white hover:bg-white/20"
                    disabled={!videoLoaded}
                  >
                    <Rewind className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSeek(10)}
                    className="p-1 h-auto text-white hover:bg-white/20"
                    disabled={!videoLoaded}
                  >
                    <Forward className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="p-1 h-auto text-white hover:bg-white/20"
                      disabled={!videoLoaded}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                    
                    <div className="hidden sm:flex items-center w-12 md:w-16">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        disabled={!videoLoaded}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                      />
                    </div>
                  </div>
                  
                  <span className="text-xs md:text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlaybackSpeed}
                    className="p-1 h-auto text-white hover:bg-white/20 flex items-center gap-1"
                    disabled={!videoLoaded}
                  >
                    <FastForward className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs font-mono">{playbackRate.toFixed(2)}x</span>
                  </Button>

                  {/* Quality Selector */}
                  <QualitySelector
                    availableQualities={availableQualities}
                    currentQuality={currentQuality}
                    isAutoMode={isAutoMode}
                    onQualityChange={(quality) => {
                      switchQuality(quality);
                      handleQualityChange(quality);
                    }}
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="p-1 h-auto text-white hover:bg-white/20"
                    disabled={!videoLoaded}
                  >
                    <Maximize className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OptimizedVideoPlayer;