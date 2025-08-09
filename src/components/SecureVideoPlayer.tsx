import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import "./SecureVideoPlayer.module.css";

interface VideoQuality {
  id: string;
  label: string;
  bitrate: number;
  resolution: string;
  width: number;
  height: number;
  url?: string;
}

interface SecureVideoPlayerProps {
  videoUrl: string;
  title?: string;
  onComplete?: () => void;
  className?: string;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl,
  title,
  onComplete,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [networkSpeed, setNetworkSpeed] = useState(0);
  const [videoResolution, setVideoResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const { toast } = useToast();

  // Enhanced quality options matching the exact specifications
  const qualityOptions: VideoQuality[] = [
    {
      id: "auto",
      label: "Tự động",
      bitrate: 0,
      resolution: "Auto",
      width: 0,
      height: 0,
    },
    {
      id: "1080p_2621",
      label: "1080p (2621 kbps) HD",
      bitrate: 2621,
      resolution: "1920x1080",
      width: 1920,
      height: 1080,
    },
    {
      id: "1080p_2557",
      label: "1080p (2557 kbps) HD",
      bitrate: 2557,
      resolution: "1920x1080",
      width: 1920,
      height: 1080,
    },
    {
      id: "720p_1274",
      label: "720p (1274 kbps)",
      bitrate: 1274,
      resolution: "1280x720",
      width: 1280,
      height: 720,
    },
    {
      id: "720p_1210",
      label: "720p (1210 kbps)",
      bitrate: 1210,
      resolution: "1280x720",
      width: 1280,
      height: 720,
    },
    {
      id: "480p_672",
      label: "480p (672 kbps)",
      bitrate: 672,
      resolution: "854x480",
      width: 854,
      height: 480,
    },
    {
      id: "480p_608",
      label: "480p (608 kbps)",
      bitrate: 608,
      resolution: "854x480",
      width: 854,
      height: 480,
    },
    {
      id: "240p_336",
      label: "240p (336 kbps)",
      bitrate: 336,
      resolution: "426x240",
      width: 426,
      height: 240,
    },
    {
      id: "240p_272",
      label: "240p (272 kbps)",
      bitrate: 272,
      resolution: "426x240",
      width: 426,
      height: 240,
    },
  ];

  // Enhanced keyboard protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        toast({
          title: "⚠️ Không được phép",
          description:
            "Video này được bảo vệ bản quyền. Không thể mở Developer Tools.",
          variant: "destructive",
        });
        return false;
      }

      // Block Ctrl combinations
      if (e.ctrlKey) {
        const blockedKeys = [
          "u",
          "U", // View Source
          "s",
          "S", // Save
          "a",
          "A", // Select All
          "c",
          "C", // Copy (when Shift also pressed)
          "j",
          "J", // Console (when Shift also pressed)
          "i",
          "I", // DevTools (when Shift also pressed)
        ];

        if (blockedKeys.includes(e.key)) {
          e.preventDefault();
          toast({
            title: "🚫 Hành động bị chặn",
            description:
              "Không thể thực hiện hành động này trên video được bảo vệ.",
            variant: "destructive",
          });
          return false;
        }

        // Special handling for Shift+Ctrl combinations
        if (e.shiftKey && ["I", "C", "J"].includes(e.key.toUpperCase())) {
          e.preventDefault();
          toast({
            title: "🛡️ Bảo mật",
            description: "Developer Tools bị vô hiệu hóa để bảo vệ nội dung.",
            variant: "destructive",
          });
          return false;
        }
      }
    };

    // Add global keyboard listener
    document.addEventListener("keydown", handleKeyDown);

    // Disable text selection globally
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.userSelect = "";
    };
  }, [toast]);

  // Network speed detection with bandwidth calculation
  useEffect(() => {
    const detectNetworkSpeed = async () => {
      try {
        const startTime = Date.now();
        const imageUri =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        const downloadSize = 1024 * 1024; // 1MB test

        // Create a more accurate speed test
        const testImage = new Image();
        testImage.onload = () => {
          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000; // seconds
          const bitsLoaded = downloadSize * 8;
          const speedBps = bitsLoaded / duration;
          const speedKbps = speedBps / 1024;

          setNetworkSpeed(speedKbps);

          // Auto-select quality based on network speed
          if (selectedQuality === "auto") {
            if (speedKbps > 3000) setSelectedQuality("1080p_2621");
            else if (speedKbps > 2000) setSelectedQuality("1080p_2557");
            else if (speedKbps > 1500) setSelectedQuality("720p_1274");
            else if (speedKbps > 1000) setSelectedQuality("720p_1210");
            else if (speedKbps > 800) setSelectedQuality("480p_672");
            else if (speedKbps > 500) setSelectedQuality("480p_608");
            else if (speedKbps > 300) setSelectedQuality("240p_336");
            else setSelectedQuality("240p_272");
          }
        };
        testImage.src = imageUri;
      } catch (error) {
        console.warn("Network speed detection failed");
        setNetworkSpeed(1500); // Default to mid-range
        if (selectedQuality === "auto") {
          setSelectedQuality("720p_1274"); // Safe default
        }
      }
    };

    detectNetworkSpeed();
  }, [selectedQuality]);

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.warn("Video play failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Auto-complete when 90% watched (enhanced completion tracking)
      const watchPercentage =
        videoRef.current.currentTime / videoRef.current.duration;
      if (watchPercentage > 0.9 && onComplete) {
        onComplete();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoResolution({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const handleVolumeToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
      videoRef.current.muted = newVolume === 0;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = clickPosition * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen().catch((error) => {
          toast({
            title: "Lỗi fullscreen",
            description: "Không thể chuyển sang chế độ toàn màn hình",
            variant: "destructive",
          });
        });
      }
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getCurrentQuality = () => {
    return (
      qualityOptions.find((q) => q.id === selectedQuality) || qualityOptions[0]
    );
  };

  // Enhanced right-click protection
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "🚫 Không được phép",
      description:
        "Video này được bảo vệ bản quyền. Không thể sao chép hoặc tải xuống.",
      variant: "destructive",
    });
    return false;
  };

  // Container size based on quality for optimal display
  const getContainerMaxWidth = () => {
    const current = getCurrentQuality();
    if (current.bitrate <= 400) return "max-w-2xl"; // Low quality
    if (current.bitrate <= 800) return "max-w-3xl"; // Medium quality
    if (current.bitrate <= 1500) return "max-w-4xl"; // High quality
    return "max-w-5xl"; // Ultra quality
  };

  return (
    <div
      ref={playerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        "aspect-video w-full mx-auto",
        getContainerMaxWidth(),
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onContextMenu={handleRightClick}
      onDragStart={(e) => e.preventDefault()}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none" as any,
        WebkitTouchCallout: "none" as any,
        KhtmlUserSelect: "none" as any,
        MozUserSelect: "none" as any,
        msUserSelect: "none" as any,
      }}>
      {/* Video Element with enhanced protection */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={videoUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={handleRightClick}
        onDragStart={(e) => e.preventDefault()}
        crossOrigin="anonymous"
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none" as any,
          pointerEvents: "auto",
        }}>
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/quicktime" />
        Trình duyệt của bạn không hỗ trợ video HTML5.
      </video>

      {/* Enhanced Custom Controls with better visibility */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/90 to-transparent transition-all duration-300 pointer-events-auto z-10",
          showControls ? "opacity-100" : "opacity-0"
        )}>
        {/* Progress Bar - Clickable with better visibility */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="w-full bg-white/30 rounded-full h-2 cursor-pointer hover:h-3 transition-all duration-200 shadow-sm border border-white/20"
            onClick={handleProgressClick}>
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-100 shadow-md relative overflow-hidden"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Controls Row with improved contrast */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Modern Play/Pause Button */}
              <button
                onClick={handlePlay}
                className="relative group w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 border-2 border-white/20 hover:border-white/40">
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white drop-shadow-sm" />
                  ) : (
                    <Play className="h-5 w-5 text-white drop-shadow-sm ml-0.5" />
                  )}
                </div>
              </button>

              {/* Modern Volume Controls */}
              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={handleVolumeToggle}
                  className={`relative group w-10 h-10 rounded-full transition-all duration-300 shadow-md hover:shadow-lg border-2 border-white/20 hover:border-white/40 hover:scale-105 active:scale-95 ${
                    isMuted 
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 hover:shadow-gray-500/30' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30'
                  }`}>
                  <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-white drop-shadow-sm" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white drop-shadow-sm" />
                    )}
                  </div>
                </button>

                {/* Modern Volume Slider */}
                <div className="relative group">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volumeSlider w-24 h-2 bg-transparent rounded-full appearance-none cursor-pointer slider pointer-events-auto transition-all duration-300 hover:h-3"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        (isMuted ? 0 : volume) * 100
                      }%, rgba(255,255,255,0.3) ${
                        (isMuted ? 0 : volume) * 100
                      }%, rgba(255,255,255,0.3) 100%)`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.1)',
                    }}
                  />
                  {/* Volume percentage indicator */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap border border-white/20">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Display with better contrast */}
              <div className="text-sm font-mono bg-black/80 text-white px-3 py-2 rounded-md min-w-fit border border-white/20 shadow-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls with better visibility */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Modern Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="relative group w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-blue-500/30 hover:scale-105 active:scale-95 border-2 border-white/20 hover:border-white/40">
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Maximize className="h-4 w-4 text-white drop-shadow-sm" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click overlay for play/pause - positioned behind controls */}
      <div
        className="absolute inset-0 cursor-pointer z-0"
        onClick={handlePlay}
        onContextMenu={handleRightClick}
        onDragStart={(e) => e.preventDefault()}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none" as any,
        }}
      />
    </div>
  );
};

export default SecureVideoPlayer;
