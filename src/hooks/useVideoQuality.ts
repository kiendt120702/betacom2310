import { useState, useCallback, useEffect } from 'react';

export interface VideoQuality {
  id: string;
  label: string;
  height: number;
  width: number;
  bitrate?: number;
  url?: string;
}

export interface QualityOption extends VideoQuality {
  active: boolean;
  available: boolean;
}

// Pre-defined quality levels (YouTube-style)
export const QUALITY_LEVELS: VideoQuality[] = [
  { id: 'auto', label: 'Tự động', height: 0, width: 0 },
  { id: '2160p', label: '2160p (4K)', height: 2160, width: 3840, bitrate: 25000 },
  { id: '1440p', label: '1440p (2K)', height: 1440, width: 2560, bitrate: 16000 },
  { id: '1080p', label: '1080p (HD)', height: 1080, width: 1920, bitrate: 8000 },
  { id: '720p', label: '720p', height: 720, width: 1280, bitrate: 5000 },
  { id: '480p', label: '480p', height: 480, width: 854, bitrate: 2500 },
  { id: '360p', label: '360p', height: 360, width: 640, bitrate: 1000 },
  { id: '240p', label: '240p', height: 240, width: 426, bitrate: 500 },
];

export const useVideoQuality = (videoElement?: HTMLVideoElement | null) => {
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>(QUALITY_LEVELS[0]);
  const [availableQualities, setAvailableQualities] = useState<QualityOption[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [detectedQuality, setDetectedQuality] = useState<VideoQuality | null>(null);

  // Detect video's native quality
  const detectVideoQuality = useCallback((video: HTMLVideoElement): VideoQuality | null => {
    if (!video.videoHeight || !video.videoWidth) return null;

    const height = video.videoHeight;
    const width = video.videoWidth;

    // Find closest matching quality
    const matchingQuality = QUALITY_LEVELS.find(q => 
      q.id !== 'auto' && 
      Math.abs(q.height - height) <= 100 && // Allow some tolerance
      Math.abs(q.width - width) <= 100
    );

    if (matchingQuality) {
      return matchingQuality;
    }

    // If no exact match, create custom quality
    let qualityLabel = '';
    if (height >= 2160) qualityLabel = '4K+';
    else if (height >= 1440) qualityLabel = '2K+';
    else if (height >= 1080) qualityLabel = '1080p+';
    else if (height >= 720) qualityLabel = '720p+';
    else if (height >= 480) qualityLabel = '480p+';
    else if (height >= 360) qualityLabel = '360p+';
    else qualityLabel = '240p+';

    return {
      id: `custom_${height}p`,
      label: `${height}p (${qualityLabel})`,
      height,
      width,
    };
  }, []);

  // Get connection-based recommended quality
  const getRecommendedQuality = useCallback((): VideoQuality => {
    const connection = (navigator as any).connection;
    
    if (!connection) return QUALITY_LEVELS[4]; // Default to 720p

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink; // Mbps

    // Recommend quality based on connection speed
    if (effectiveType === '4g' && downlink > 10) {
      return QUALITY_LEVELS[3]; // 1080p
    } else if (effectiveType === '4g' && downlink > 5) {
      return QUALITY_LEVELS[4]; // 720p
    } else if (effectiveType === '3g' || downlink > 2) {
      return QUALITY_LEVELS[5]; // 480p
    } else {
      return QUALITY_LEVELS[6]; // 360p
    }
  }, []);

  // Generate quality options based on detected video quality
  const generateQualityOptions = useCallback((detectedQuality: VideoQuality): QualityOption[] => {
    const options: QualityOption[] = [];
    
    // Always include auto mode
    options.push({
      ...QUALITY_LEVELS[0],
      active: isAutoMode,
      available: true,
    });

    // Add qualities up to detected quality
    QUALITY_LEVELS.slice(1).forEach(quality => {
      if (detectedQuality && quality.height <= detectedQuality.height) {
        options.push({
          ...quality,
          active: !isAutoMode && currentQuality.id === quality.id,
          available: true,
        });
      } else {
        // Quality higher than source - not available
        options.push({
          ...quality,
          active: false,
          available: false,
        });
      }
    });

    return options.reverse(); // Show highest quality first
  }, [currentQuality, isAutoMode]);

  // Simulate quality switching (since we don't have multiple quality URLs)
  const switchQuality = useCallback((quality: VideoQuality) => {
    if (!videoElement) return;

    const currentTime = videoElement.currentTime;
    const wasPlaying = !videoElement.paused;

    // Save current state
    setCurrentQuality(quality);
    
    if (quality.id === 'auto') {
      setIsAutoMode(true);
      const recommended = getRecommendedQuality();
      setCurrentQuality(recommended);
    } else {
      setIsAutoMode(false);
    }

    // Simulate quality change effect
    // In real implementation, you would switch video source URL
    
    // Add visual feedback
    const qualityChangeEvent = new CustomEvent('qualitychange', {
      detail: { quality: quality.label }
    });
    videoElement.dispatchEvent(qualityChangeEvent);

    // Restore playback position
    videoElement.currentTime = currentTime;
    if (wasPlaying) {
      videoElement.play().catch(() => {});
    }
  }, [videoElement, getRecommendedQuality]);

  // Monitor video and connection changes
  useEffect(() => {
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      const detected = detectVideoQuality(videoElement);
      if (detected) {
        setDetectedQuality(detected);
        
        // Set initial quality based on auto mode
        if (isAutoMode) {
          const recommended = getRecommendedQuality();
          setCurrentQuality(recommended);
        }
      }
    };

    const handleQualityChange = (event: Event) => {
      const customEvent = event as CustomEvent;
};

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('qualitychange', handleQualityChange);

    // Check if metadata is already loaded
    if (videoElement.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('qualitychange', handleQualityChange);
    };
  }, [videoElement, detectVideoQuality, getRecommendedQuality, isAutoMode]);

  // Update available qualities when detected quality changes
  useEffect(() => {
    if (detectedQuality) {
      const options = generateQualityOptions(detectedQuality);
      setAvailableQualities(options);
    }
  }, [detectedQuality, generateQualityOptions]);

  // Monitor connection changes for auto quality
  useEffect(() => {
    if (!isAutoMode) return;

    const handleConnectionChange = () => {
      const recommended = getRecommendedQuality();
      setCurrentQuality(recommended);
    };

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, [isAutoMode, getRecommendedQuality]);

  return {
    currentQuality,
    availableQualities,
    detectedQuality,
    isAutoMode,
    switchQuality,
    getRecommendedQuality,
  };
};