import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import FastPreviewVideoPlayer from './FastPreviewVideoPlayer';
import { TrainingExercise } from '@/types/training';

interface VideoPreviewDialogProps {
  exercise: TrainingExercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoPreviewDialog: React.FC<VideoPreviewDialogProps> = ({
  exercise,
  open,
  onOpenChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!exercise.exercise_video_url) return null;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span>Xem trước video: {exercise.title}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div>
            <FastPreviewVideoPlayer
              videoUrl={exercise.exercise_video_url}
              title={exercise.title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreviewDialog;