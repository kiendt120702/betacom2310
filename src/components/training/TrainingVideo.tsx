import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OptimizedVideoPlayer from '@/components/video/OptimizedVideoPlayer';
import { useVideoOptimization } from '@/hooks/useVideoOptimization';
import { useVideoProgressWithRequirements } from '@/hooks/useVideoProgressWithRequirements';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface TrainingVideoProps {
  videoUrl: string;
  title: string;
  exerciseId: string;
  requiredViewingCount?: number;
  isCompleted?: boolean;
  onVideoComplete: () => void;
  onProgress?: (progress: number) => void;
  onSaveTimeSpent: (seconds: number) => void;
}

const TrainingVideo: React.FC<TrainingVideoProps> = ({
  videoUrl,
  title,
  exerciseId,
  requiredViewingCount = 1,
  isCompleted = false,
  onVideoComplete,
  onProgress,
  onSaveTimeSpent,
}) => {
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const { processVideo, isProcessing } = useVideoOptimization();
  const { data: videoProgress, updateVideoProgress } = useVideoProgressWithRequirements(exerciseId);
  
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentSession, setCurrentSession] = useState(1);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video session count from existing progress
  useEffect(() => {
    if (videoProgress) {
      setCurrentSession(videoProgress.session_count || 1);
      setVideoDuration(videoProgress.video_duration || 0);
    }
  }, [videoProgress]);

  // Generate thumbnail when video URL changes (only once per video)
  useEffect(() => {
    const optimizeVideo = async () => {
      if (!videoUrl) return;
      
      const result = await processVideo(videoUrl, {
        generateThumbnail: true,
        thumbnailTime: 2, // Generate thumbnail at 2 second mark
        checkQuality: true // This will only show toast once per video now
      });
      
      if (result.thumbnailUrl) {
        setThumbnail(result.thumbnailUrl);
      }
    };

    // Only process if we have a videoUrl and haven't started processing yet
    if (videoUrl && !thumbnail && !isProcessing) {
      optimizeVideo();
    }
  }, [videoUrl]); // Removed processVideo and isProcessing from deps to prevent re-runs

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced video completion handler with 90% requirement and session tracking
  const handleVideoComplete = async () => {
    // Update video progress tracking with 90% completion
    updateVideoProgress({
      exercise_id: exerciseId,
      time_spent: Math.floor(videoDuration * 0.9), // At least 90% watched
      video_duration: videoDuration,
      watch_percentage: 90,
      session_count: currentSession,
    });

    // Increment video view count using the database function
    try {
      const { data } = await supabase.rpc('increment_video_view_count', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_exercise_id: exerciseId
      });
      
      logger.info(`Video view count incremented`, { count: data, exerciseId }, "TrainingVideo");
      
      // Update current session count to reflect the new count
      if (typeof data === 'number') {
        setCurrentSession(data);
      }
    } catch (error) {
      logger.error('Failed to increment video view count', { error, exerciseId }, "TrainingVideo");
    }

    // Only call the original completion handler if requirements are fully met
    const hasWatchedRequiredTimes = currentSession >= requiredViewingCount;
    if (hasWatchedRequiredTimes) {
      onVideoComplete();
    }
  };

  // Debounced update function to prevent excessive database calls
  const debouncedUpdateProgress = (updateData: any) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateVideoProgress(updateData);
    }, 1000); // Wait 1 second before updating
  };

  // Enhanced progress handler with throttling to prevent infinite loop
  const handleProgress = (progress: number) => {
    onProgress?.(progress);
    
    // Only update database when reaching significant milestones and avoid excessive updates
    const progressMilestone = Math.floor(progress);
    const lastMilestone = Math.floor(videoProgress?.watch_percentage || 0);
    
    if (progressMilestone > lastMilestone && progressMilestone % 10 === 0 && videoDuration > 0) {
      debouncedUpdateProgress({
        exercise_id: exerciseId,
        time_spent: Math.floor((videoDuration * progress) / 100),
        video_duration: videoDuration,
        watch_percentage: progressMilestone,
        session_count: currentSession,
      });
    }
  };

  // Enhanced time spent handler with reduced database calls
  const handleSaveTimeSpent = (seconds: number) => {
    // Only save time to the original system, avoid double tracking
    onSaveTimeSpent(seconds);
    
    // Remove the updateVideoProgress call here to prevent conflicts
    // Time spent will be updated through the main progress tracking system
  };

  // Handler to capture video duration when metadata is loaded
  const handleVideoLoaded = (duration: number) => {
    setVideoDuration(duration);
    
    // Only update video duration if not already set to avoid unnecessary calls
    if (duration > 0 && (!videoProgress || !videoProgress.video_duration)) {
      updateVideoProgress({
        exercise_id: exerciseId,
        video_duration: duration,
        session_count: currentSession,
      });
    }
  };

  const hasMetRequirements = videoProgress?.is_requirement_met || false;

  return (
    <Card className="w-full">
      <CardContent className="p-3 md:p-6">
        <OptimizedVideoPlayer
          videoUrl={videoUrl}
          title={title}
          isCompleted={hasMetRequirements}
          onVideoComplete={handleVideoComplete}
          onProgress={handleProgress}
          onSaveTimeSpent={handleSaveTimeSpent}
          onVideoLoaded={handleVideoLoaded}
          thumbnail={thumbnail}
        />
      </CardContent>
    </Card>
  );
};

export default TrainingVideo;