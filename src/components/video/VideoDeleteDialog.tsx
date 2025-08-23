import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useUpdateExerciseVideo, useDeleteEduExercise } from '@/hooks/useEduExercises';
import { TrainingExercise } from '@/types/training';

interface VideoDeleteDialogProps {
  exercise: TrainingExercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  deleteVideoOnly?: boolean; // True = chỉ xóa video, False = xóa cả bài tập
}

const VideoDeleteDialog: React.FC<VideoDeleteDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  onSuccess,
  deleteVideoOnly = true,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const updateExerciseVideo = useUpdateExerciseVideo();
  const deleteExercise = useDeleteEduExercise();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      if (deleteVideoOnly) {
        // Delete video only by setting URL to null
        if (!exercise.exercise_video_url) return;
        await updateExerciseVideo.mutateAsync({
          exerciseId: exercise.id,
          videoUrl: null,
        });
      } else {
        // Delete entire exercise (this will also delete video from storage)
        await deleteExercise.mutateAsync(exercise.id);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error during delete operation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDialogContent = () => {
    if (deleteVideoOnly) {
      return {
        title: 'Xóa video bài học',
        description: `Bạn có chắc chắn muốn xóa video của bài tập "${exercise.title}"? Video sẽ bị xóa vĩnh viễn nhưng bài tập vẫn được giữ lại.`,
        actionText: 'Xóa video',
        actionClass: 'bg-orange-600 hover:bg-orange-700',
      };
    } else {
      return {
        title: 'Xóa bài tập và video',
        description: `Bạn có chắc chắn muốn xóa hoàn toàn bài tập "${exercise.title}" và video liên quan? Hành động này không thể hoàn tác.`,
        actionText: 'Xóa hoàn toàn',
        actionClass: 'bg-red-600 hover:bg-red-700',
      };
    }
  };

  const content = getDialogContent();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{content.description}</p>
            
            {exercise.exercise_video_url && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Video hiện tại:
                </p>
                <p className="text-xs font-mono break-all text-muted-foreground">
                  {exercise.exercise_video_url}
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-700 dark:text-orange-300">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Video sẽ bị xóa vĩnh viễn khỏi server</li>
                  <li>• Không thể khôi phục sau khi xóa</li>
                  {deleteVideoOnly ? (
                    <li>• Bài tập vẫn được giữ lại, chỉ xóa video</li>
                  ) : (
                    <li>• Toàn bộ bài tập và dữ liệu liên quan sẽ bị xóa</li>
                  )}
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={content.actionClass}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {content.actionText}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VideoDeleteDialog;