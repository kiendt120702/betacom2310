import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VideoOptimizationResult {
  thumbnailUrl?: string;
  optimizedUrl?: string;
  error?: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
}

export const useVideoOptimization = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideos, setProcessedVideos] = useState(new Set<string>());
  const { toast } = useToast();

  // Generate video thumbnail from video URL
  const generateThumbnail = useCallback(async (videoUrl: string, timeOffset: number = 1): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(null);
        return;
      }

      video.crossOrigin = 'anonymous';
      video.currentTime = timeOffset;
      
      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        try {
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailDataUrl);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          resolve(null);
        }
      };

      video.onerror = () => resolve(null);
      video.src = videoUrl;
    });
  }, []);

  // Get video metadata
  const getVideoMetadata = useCallback(async (videoUrl: string): Promise<VideoMetadata | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: 0, // Size would need to be passed separately
          type: video.src.split('.').pop()?.toLowerCase() || 'unknown'
        };
        resolve(metadata);
      };

      video.onerror = () => resolve(null);
      video.src = videoUrl;
    });
  }, []);

  // Check if video needs optimization based on file size and quality
  const shouldOptimize = useCallback((metadata: VideoMetadata, fileSize?: number): boolean => {
    if (!metadata) return false;
    
    // Only show optimization warning for significantly large/long videos
    // Optimize if file is over 500MB (not 100MB to reduce false positives)
    if (fileSize && fileSize > 500 * 1024 * 1024) return true;
    
    // Only warn for very high resolution (4K+ only)
    if (metadata.width > 3840 || metadata.height > 2160) return true;
    
    // Only warn for very long videos (over 60 minutes)
    if (metadata.duration > 60 * 60) return true;
    
    return false;
  }, []);

  // Get optimal preload strategy based on connection
  const getPreloadStrategy = useCallback((): 'none' | 'metadata' | 'auto' => {
    const connection = (navigator as any).connection;
    
    if (!connection) return 'metadata'; // Default fallback
    
    switch (connection.effectiveType) {
      case '4g':
        return 'auto'; // Fast connection - preload everything
      case '3g':
        return 'metadata'; // Medium connection - preload metadata only
      case '2g':
      case 'slow-2g':
        return 'none'; // Slow connection - no preload
      default:
        return 'metadata';
    }
  }, []);

  // Generate adaptive bitrate URLs (if supported by backend)
  const getAdaptiveUrls = useCallback((baseUrl: string) => {
    // This would be implemented if you have server-side video processing
    // For now, return the original URL with quality hints
    const urlParams = new URL(baseUrl, window.location.origin);
    
    return {
      high: baseUrl, // Original quality
      medium: `${urlParams.pathname}?quality=720p`, // Hypothetical medium quality
      low: `${urlParams.pathname}?quality=480p`, // Hypothetical low quality
      auto: baseUrl // Let browser decide
    };
  }, []);

  // Process video for optimization
  const processVideo = useCallback(async (
    videoUrl: string, 
    options: {
      generateThumbnail?: boolean;
      thumbnailTime?: number;
      checkQuality?: boolean;
    } = {}
  ): Promise<VideoOptimizationResult> => {
    // Skip if already processed
    if (processedVideos.has(videoUrl)) {
      return { optimizedUrl: videoUrl };
    }

    setIsProcessing(true);
    
    try {
      const result: VideoOptimizationResult = {};
      
      // Generate thumbnail if requested
      if (options.generateThumbnail) {
        const thumbnailTime = options.thumbnailTime || 1;
        const thumbnail = await generateThumbnail(videoUrl, thumbnailTime);
        if (thumbnail) {
          result.thumbnailUrl = thumbnail;
        }
      }
      
      // Get metadata and check if optimization is needed (only show toast once)
      if (options.checkQuality && !processedVideos.has(videoUrl)) {
        const metadata = await getVideoMetadata(videoUrl);
        if (metadata && shouldOptimize(metadata)) {
          // Only show toast once per video
          toast({
            title: "Video có thể cần tối ưu",
            description: `Video có độ phân giải ${metadata.width}x${metadata.height} và thời lượng ${Math.round(metadata.duration / 60)} phút. Có thể sẽ tải chậm.`,
            duration: 5000,
          });
        }
        
        // Mark as processed to prevent re-showing toast
        setProcessedVideos(prev => new Set([...prev, videoUrl]));
      }
      
      result.optimizedUrl = videoUrl;
      return result;
      
    } catch (error: any) {
      console.error('Video processing error:', error);
      return {
        error: error.message || 'Lỗi xử lý video'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [generateThumbnail, getVideoMetadata, shouldOptimize, toast, processedVideos]);

  // Smart preloader that preloads based on user behavior and connection
  const createSmartPreloader = useCallback((videoUrls: string[]) => {
    const preloadStrategy = getPreloadStrategy();
    const preloadedVideos = new Set<string>();

    const preloadVideo = (url: string) => {
      if (preloadedVideos.has(url)) return;
      
      const video = document.createElement('video');
      video.preload = preloadStrategy;
      video.src = url;
      video.load();
      
      preloadedVideos.add(url);
      
      // Clean up after some time to save memory
      setTimeout(() => {
        video.remove();
      }, 5 * 60 * 1000); // 5 minutes
    };

    // Preload first video immediately
    if (videoUrls.length > 0) {
      preloadVideo(videoUrls[0]);
    }

    // Preload next video when user scrolls or interacts
    const preloadNext = () => {
      if (videoUrls.length > 1) {
        preloadVideo(videoUrls[1]);
      }
    };

    return { preloadNext };
  }, [getPreloadStrategy]);

  return {
    isProcessing,
    generateThumbnail,
    getVideoMetadata,
    getPreloadStrategy,
    getAdaptiveUrls,
    processVideo,
    createSmartPreloader,
    shouldOptimize
  };
};