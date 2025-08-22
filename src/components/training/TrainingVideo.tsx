import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, Pause, Volume2, VolumeX, Maximize, FastForward, Clock } from 'lucide-react'; // Import Clock icon
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TrainingVideoProps {
  videoUrl: string;
  title: string;
  isCompleted?: boolean;
  onVideoComplete: () => void;
  onProgress?: (progress: number) => void;
  onSaveTimeSpent: (seconds: number) => void; // New prop to save time
}

const TrainingVideo: React.FC<TrainingVideoProps> = ({
  videoUrl,
  title,
  isCompleted = false,
  onVideoComplete,
  onProgress,
  onSaveTimeSpent,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasWatchedToEnd, setHasWatchedToEnd] = useState(false);
  const maxWatchedTimeRef = useRef(0);
  const { toast } = useToast();
  const [playbackRate, setPlaybackRate] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0); // New state for displayed elapsed time

  // Refs for time tracking
  const timeSpentRef = useRef(0); // For accumulating total time to save
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // For saving interval
  const displayTimerIntervalRef = useRef<NodeJS.Timeout | null>(null); // For display timer interval

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
      videoRef.current.play();
    }
  }, [isPlaying]);

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

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    const progressPercent = (current / total) * 100;

    // Prevent seeking forward
    if (current > maxWatchedTimeRef.current + 1) { // +1s buffer for normal playback
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
  }, [onVideoComplete, onProgress, hasWatchedToEnd, toast]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    // Start interval for saving time
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      timeSpentRef.current += 1;
    }, 1000);
    // Start interval for display timer
    if (displayTimerIntervalRef.current) clearInterval(displayTimerIntervalRef.current);
    displayTimerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    // Clear intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (displayTimerIntervalRef.current) clearInterval(displayTimerIntervalRef.current);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    // Clear intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (displayTimerIntervalRef.current) clearInterval(displayTimerIntervalRef.current);
    setHasWatchedToEnd(true);
    onVideoComplete();
  }, [onVideoComplete]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (clickX / width) * 100;
    const newTime = (percentage / 100) * duration;

    if (newTime > maxWatchedTimeRef.current) {
      toast({
        title: "Cảnh báo",
        description: "Bạn không thể tua đến đoạn chưa xem.",
        variant: "destructive",
      });
      return;
    }

    videoRef.current.currentTime = newTime;
    setProgress(percentage);
  }, [duration, toast]);

  const handleRateChange = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.playbackRate > 1.25) {
        videoRef.current.playbackRate = 1.25;
        toast({
          title: "Giới hạn tốc độ",
          description: "Tốc độ xem video tối đa là 1.25x.",
        });
      }
      setPlaybackRate(videoRef.current.playbackRate);
    }
  }, [toast]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('ratechange', handleRateChange);
      return () => {
        videoElement.removeEventListener('ratechange', handleRateChange);
      };
    }
  }, [handleRateChange]);

  // Cleanup effect to save time and clear intervals when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (displayTimerIntervalRef.current) clearInterval(displayTimerIntervalRef.current);
      if (timeSpentRef.current > 0) {
        onSaveTimeSpent(timeSpentRef.current);
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-base">Video hướng dẫn</CardTitle>
            {isCompleted && (
              <Badge variant="default" className="bg-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Đã hoàn thành
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden group w-full">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              preload="metadata"
            />
            
            {/* Custom video controls */}
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
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <Play className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="p-1 h-auto text-white hover:bg-white/20"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                    
                    {/* Volume slider - hidden on very small screens */}
                    <div className="hidden sm:flex items-center w-12 md:w-16">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
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
                  {/* Live Elapsed Time Display */}
                  <div className="flex items-center gap-1 text-xs md:text-sm font-mono">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    <span>{formatTime(elapsedTime)}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlaybackSpeed}
                    className="p-1 h-auto text-white hover:bg-white/20 flex items-center gap-1"
                  >
                    <FastForward className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs font-mono">{playbackRate.toFixed(2)}x</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="p-1 h-auto text-white hover:bg-white/20"
                  >
                    <Maximize className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TrainingVideo;