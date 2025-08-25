import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVideoPlayerStateProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCompleted: boolean;
  onVideoComplete: () => void;
  onProgress?: (progress: number) => void;
  onSaveTimeSpent: (seconds: number) => void;
}

export const useVideoPlayerState = ({
  videoRef,
  isCompleted,
  onVideoComplete,
  onProgress,
  onSaveTimeSpent,
}: UseVideoPlayerStateProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasWatchedToEnd, setHasWatchedToEnd] = useState(isCompleted);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const maxWatchedTimeRef = useRef(0);
  const { toast } = useToast();
  const timeSpentRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef(0);

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
  }, [isPlaying, toast, videoRef]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted, videoRef]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  }, [isMuted, videoRef]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, [videoRef]);

  const togglePlaybackSpeed = useCallback(() => {
    if (!videoRef.current) return;
    const newRate = videoRef.current.playbackRate === 1 ? 1.25 : 1;
    videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
    toast({
      title: "Tốc độ phát",
      description: `Đã đổi tốc độ thành ${newRate}x`,
    });
  }, [toast, videoRef]);

  const handleLoadStart = useCallback(() => setIsLoading(true), []);
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (isCompleted) maxWatchedTimeRef.current = videoRef.current.duration;
    }
  }, [isCompleted, videoRef]);
  const handleCanPlayThrough = useCallback(() => setIsLoading(false), []);
  const handleWaiting = useCallback(() => setIsBuffering(true), []);
  const handlePlaying = useCallback(() => setIsBuffering(false), []);
  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử lại.');
  }, []);

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
  }, [onVideoComplete, onProgress, hasWatchedToEnd, toast, isCompleted, videoRef]);

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
    if (!videoRef.current) return;
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
  }, [duration, toast, isCompleted, hasWatchedToEnd, videoRef]);

  const handleSeek = useCallback((seconds: number) => {
    if (!videoRef.current) return;
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
  }, [duration, toast, isCompleted, hasWatchedToEnd, videoRef]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      const timeToSave = timeSpentRef.current - lastSavedTimeRef.current;
      if (timeToSave > 0) {
        onSaveTimeSpent(timeToSave);
        lastSavedTimeRef.current = timeSpentRef.current;
      }
    }, 10000);

    return () => {
      clearInterval(saveInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const remainingTimeToSave = timeSpentRef.current - lastSavedTimeRef.current;
      if (remainingTimeToSave > 0) {
        onSaveTimeSpent(remainingTimeToSave);
      }
    };
  }, [onSaveTimeSpent]);

  return {
    isPlaying,
    isMuted,
    volume,
    progress,
    duration,
    currentTime,
    playbackRate,
    isLoading,
    isBuffering,
    error,
    videoLoaded,
    loadingProgress,
    formatTime,
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    toggleFullscreen,
    togglePlaybackSpeed,
    handleProgressClick,
    handleSeek,
    eventHandlers: {
      onLoadStart: handleLoadStart,
      onLoadedMetadata: handleLoadedMetadata,
      onCanPlayThrough: handleCanPlayThrough,
      onWaiting: handleWaiting,
      onPlaying: handlePlaying,
      onError: handleError,
      onTimeUpdate: handleTimeUpdate,
      onPlay: handlePlay,
      onPause: handlePause,
      onEnded: handleEnded,
    },
  };
};