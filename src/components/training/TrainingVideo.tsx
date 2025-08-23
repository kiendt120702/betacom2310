import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OptimizedVideoPlayer from '@/components/video/OptimizedVideoPlayer';
import { useVideoOptimization } from '@/hooks/useVideoOptimization';

interface TrainingVideoProps {
  videoUrl: string;
  title: string;
  isCompleted?: boolean;
  onVideoComplete: () => void;
  onProgress?: (progress: number) => void;
  onSaveTimeSpent: (seconds: number) => void;
}

const TrainingVideo: React.FC<TrainingVideoProps> = ({
  videoUrl,
  title,
  isCompleted = false,
  onVideoComplete,
  onProgress,
  onSaveTimeSpent,
}) => {
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const { processVideo, isProcessing } = useVideoOptimization();

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

  return (
    <Card className="w-full">
      <CardContent className="p-3 md:p-6">
        <OptimizedVideoPlayer
          videoUrl={videoUrl}
          title={title}
          isCompleted={isCompleted}
          onVideoComplete={onVideoComplete}
          onProgress={onProgress}
          onSaveTimeSpent={onSaveTimeSpent}
          thumbnail={thumbnail}
        />
      </CardContent>
    </Card>
  );
};

export default TrainingVideo;