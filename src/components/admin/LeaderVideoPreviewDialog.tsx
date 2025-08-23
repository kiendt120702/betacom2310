import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import FastPreviewVideoPlayer from '@/components/video/FastPreviewVideoPlayer';
import { LeaderTrainingExercise } from '@/hooks/useLeaderTraining';

interface LeaderVideoPreviewDialogProps {
  exercise: LeaderTrainingExercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeaderVideoPreviewDialog: React.FC<LeaderVideoPreviewDialogProps> = ({
  exercise,
  open,
  onOpenChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!exercise.video_url) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span>Xem trước video Leader: {exercise.title}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden">
            <FastPreviewVideoPlayer
              videoUrl={exercise.video_url}
              title={exercise.title}
            />
          </div>

          {/* Video Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Tên bài tập Leader:</span>
              <p className="mt-1">{exercise.title}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Mô tả:</span>
              <p className="mt-1">{exercise.description || 'Không có mô tả'}</p>
            </div>
            {exercise.is_required && (
              <div>
                <span className="font-medium text-muted-foreground">Yêu cầu:</span>
                <p className="mt-1">Bài tập bắt buộc</p>
              </div>
            )}
            {exercise.min_review_videos && (
              <div>
                <span className="font-medium text-muted-foreground">Số video cần xem:</span>
                <p className="mt-1">{exercise.min_review_videos} video</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderVideoPreviewDialog;