import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OptimizedVideoPlayer from '@/components/video/OptimizedVideoPlayer';
import { useVideoOptimization } from '@/hooks/useVideoOptimization';
import { useVideoProgressWithRequirements } from '@/hooks/useVideoProgressWithRequirements';

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

  // Enhanced video completion handler with 90% requirement and session tracking
  const handleVideoComplete = () => {
    // Update video progress tracking with 90% completion
    updateVideoProgress({
      exercise_id: exerciseId,
      time_spent: Math.floor(videoDuration * 0.9), // At least 90% watched
      video_duration: videoDuration,
      watch_percentage: 90,
      session_count: currentSession,
    });

    // Only call the original completion handler if requirements are fully met
    const hasWatchedRequiredTimes = currentSession >= requiredViewingCount;
    if (hasWatchedRequiredTimes) {
      onVideoComplete();
    }
  };

  // Enhanced progress handler
  const handleProgress = (progress: number) => {
    if (progress >= 90) {
      // Update video tracking when 90% is reached
      updateVideoProgress({
        exercise_id: exerciseId,
        time_spent: Math.floor((videoDuration * progress) / 100),
        video_duration: videoDuration,
        watch_percentage: Math.floor(progress),
        session_count: currentSession,
      });
    }
    
    onProgress?.(progress);
  };

  // Enhanced time spent handler
  const handleSaveTimeSpent = (seconds: number) => {
    // Save time to both the original system and video tracking
    onSaveTimeSpent(seconds);
    
    if (videoDuration > 0) {
      updateVideoProgress({
        exercise_id: exerciseId,
        time_spent: Math.floor(seconds),
        video_duration: videoDuration,
        watch_percentage: Math.floor((seconds / videoDuration) * 100),
        session_count: currentSession,
      });
    }
  };

  // Handler to capture video duration when metadata is loaded
  const handleVideoLoaded = (duration: number) => {
    setVideoDuration(duration);
    
    // Update video tracking with duration if not already set
    if (duration > 0) {
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