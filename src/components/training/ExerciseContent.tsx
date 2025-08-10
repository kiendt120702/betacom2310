
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Video, CheckCircle, FileText, Eye } from 'lucide-react';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';
import { useExerciseRecaps } from '@/hooks/useExerciseRecaps';
import RecapSubmissionDialog from './RecapSubmissionDialog';
import { secureLog } from '@/lib/utils';

interface Exercise {
  id: string;
  title: string;
  description?: string;
  content?: string;
  exercise_video_url?: string;
  min_completion_time?: number;
  min_study_sessions?: number;
  min_review_videos?: number;
  required_review_videos?: number;
  is_required?: boolean;
  order_index?: number;
}

interface ExerciseContentProps {
  exercise: Exercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({ exercise, onComplete }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isRecapDialogOpen, setIsRecapDialogOpen] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const {
    data: progress,
    isLoading: progressLoading,
    updateProgress,
    isUpdating
  } = useUserExerciseProgress(exercise.id);

  const {
    data: recaps,
    createRecap,
    isCreating: isCreatingRecap
  } = useExerciseRecaps(exercise.id);

  // Track time spent
  useEffect(() => {
    const startTime = Date.now();
    setSessionStartTime(startTime);

    const interval = setInterval(() => {
      if (sessionStartTime) {
        const currentTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        setTimeSpent(currentTime);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Save time spent when component unmounts
      if (sessionStartTime) {
        const finalTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
        updateProgress({
          time_spent: (progress?.time_spent || 0) + finalTimeSpent
        });
      }
    };
  }, [sessionStartTime, progress?.time_spent, updateProgress]);

  const handleVideoComplete = () => {
    setVideoWatched(true);
    updateProgress({
      video_completed: true
    });
  };

  const handleRecapSubmit = async (content: string) => {
    try {
      await createRecap({ recap_content: content });
      await updateProgress({
        recap_submitted: true
      });
      setIsRecapDialogOpen(false);
      
      // Check if exercise is complete
      const hasCompletedVideo = progress?.video_completed || videoWatched;
      const hasSubmittedRecap = true; // Just submitted
      const hasMetTimeRequirement = (progress?.time_spent || 0) + timeSpent >= (exercise.min_completion_time || 5) * 60;
      
      if (hasCompletedVideo && hasSubmittedRecap && hasMetTimeRequirement) {
        await updateProgress({
          is_completed: true,
          completed_at: new Date().toISOString()
        });
        onComplete?.();
      }
    } catch (error) {
      secureLog('Error submitting recap:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCompleted = progress?.is_completed || false;
  const totalTimeSpent = (progress?.time_spent || 0) + timeSpent;
  const minTimeRequired = (exercise.min_completion_time || 5) * 60;
  const hasMetTimeRequirement = totalTimeSpent >= minTimeRequired;
  const hasWatchedVideo = progress?.video_completed || videoWatched;
  const hasSubmittedRecap = progress?.recap_submitted || false;

  if (progressLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Tiến độ học tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>
                <p className="text-sm text-muted-foreground">Thời gian</p>
                <p className="font-medium">
                  {formatTime(totalTimeSpent)} / {formatTime(minTimeRequired)}
                </p>
                <Badge variant={hasMetTimeRequirement ? "default" : "secondary"}>
                  {hasMetTimeRequirement ? "Đạt yêu cầu" : "Chưa đủ"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <div>
                <p className="text-sm text-muted-foreground">Video</p>
                <Badge variant={hasWatchedVideo ? "default" : "secondary"}>
                  {hasWatchedVideo ? "Đã xem" : "Chưa xem"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <div>
                <p className="text-sm text-muted-foreground">Recap</p>
                <Badge variant={hasSubmittedRecap ? "default" : "secondary"}>
                  {hasSubmittedRecap ? "Đã nộp" : "Chưa nộp"}
                </Badge>
              </div>
            </div>
          </div>
          
          {isCompleted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Bài tập đã hoàn thành!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Content */}
      <Card>
        <CardHeader>
          <CardTitle>{exercise.title}</CardTitle>
          {exercise.description && (
            <p className="text-muted-foreground">{exercise.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {exercise.content && (
            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: exercise.content }} />
            </div>
          )}
          
          {exercise.exercise_video_url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video bài tập
              </h3>
              <div className="aspect-video">
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  onEnded={handleVideoComplete}
                >
                  <source src={exercise.exercise_video_url} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => setIsRecapDialogOpen(true)}
          disabled={!hasWatchedVideo || hasSubmittedRecap || isCreatingRecap}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {hasSubmittedRecap ? "Đã nộp recap" : "Nộp recap"}
        </Button>
        
        {recaps && recaps.length > 0 && (
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Xem recap đã nộp
          </Button>
        )}
      </div>

      <RecapSubmissionDialog
        open={isRecapDialogOpen}
        onOpenChange={setIsRecapDialogOpen}
        onSubmit={handleRecapSubmit}
        exerciseTitle={exercise.title}
        isSubmitting={isCreatingRecap}
      />
    </div>
  );
};

export default ExerciseContent;
