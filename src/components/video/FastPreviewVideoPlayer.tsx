import React, { useCallback, useState, useRef, useEffect } from 'react';
import { CheckCircle, Play, Pause, Volume2, VolumeX, Maximize, FastForward, Clock, Rewind, Forward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FastPreviewVideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
}

const FastPreviewVideoPlayer: React.FC<FastPreviewVideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnail,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Minimal loading states - faster UX
  const [isLoading, setIsLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current || !videoReady) return;
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
  }, [isPlaying, videoReady, toast]);

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
    const newRate = videoRef.current.playbackRate === 1 ? 1.25 : videoRef.current.playbackRate === 1.25 ? 1.5 : 1;
    videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  }, []);

  // Ultra-fast loading - prioritize immediate availability
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Video ready as soon as metadata loads for preview
      setIsLoading(false);
      setVideoReady(true);
    }
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử lại.');
    toast({
      title: "Lỗi tải video",
      description: "Có lỗi xảy ra khi tải video.",
      variant: "destructive",
    });
  }, [toast]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    const progressPercent = (current / total) * 100;
    setCurrentTime(current);
    setProgress(progressPercent);
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Fast seeking for preview mode
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoReady) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (clickX / width) * 100;
    const newTime = (percentage / 100) * duration;
    videoRef.current.currentTime = newTime;
    setProgress(percentage);
  }, [duration, videoReady]);

  const handleSeek = useCallback((seconds: number) => {
    if (!videoRef.current || !videoReady) return;
    const newTime = videoRef.current.currentTime + seconds;
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
  }, [duration, videoReady]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
          <h3 className="text-sm md:text-base font-semibold">Xem trước: {title}</h3>
          <Badge variant="outline" className="text-xs">
            Fast Preview - Tải nhanh
          </Badge>
        </div>

        {/* Time tracker */}
        <div className="mb-4 flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-md">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-base text-muted-foreground">
            Thời gian xem: <span className="font-bold text-lg text-primary">{formatTime(elapsedTime)}</span>
          </p>
        </div>

        <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden group w-full">
          {/* Minimal loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <div className="text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-xs text-muted-foreground">Tải nhanh...</p>
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

          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail}
            className="w-full h-full object-contain"
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          />
          
          {/* Custom video controls */}
          {videoReady && (
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
                    disabled={!videoReady}
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
                    disabled={!videoReady}
                  >
                    <Rewind className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSeek(10)}
                    className="p-1 h-auto text-white hover:bg-white/20"
                    disabled={!videoReady}
                  >
                    <Forward className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="p-1 h-auto text-white hover:bg-white/20"
                      disabled={!videoReady}
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
                        disabled={!videoReady}
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
                    disabled={!videoReady}
                  >
                    <FastForward className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs font-mono">{playbackRate.toFixed(2)}x</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="p-1 h-auto text-white hover:bg-white/20"
                    disabled={!videoReady}
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

export default FastPreviewVideoPlayer;