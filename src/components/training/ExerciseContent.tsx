
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, PlayCircle } from 'lucide-react';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';
import SecureVideoPlayer from '@/components/SecureVideoPlayer';
import RecapSubmissionDialog from './RecapSubmissionDialog';

interface ExerciseContentProps {
  exercise: {
    id: string;
    title: string;
    content?: string;
    exercise_video_url?: string;
    min_completion_time?: number;
    required_review_videos?: number;
  };
  onExerciseComplete?: () => void;
  onRecapSubmit?: (content: string) => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onExerciseComplete,
  onRecapSubmit,
}) => {
  const [showRecapDialog, setShowRecapDialog] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const {
    data: progress,
    markVideoCompleted,
    markRecapSubmitted,
    isUpdating
  } = useUserExerciseProgress(exercise.id);

  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const interval = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleVideoComplete = async () => {
    await markVideoCompleted();
    onExerciseComplete?.();
  };

  const handleRecapSubmit = async (content: string) => {
    await markRecapSubmitted(content);
    setShowRecapDialog(false);
    onRecapSubmit?.(content);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const minTime = exercise.min_completion_time || 5;
  const canSubmitRecap = timeSpent >= minTime * 60 && progress?.video_completed;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{exercise.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Thời gian: {formatTime(timeSpent)}
              </span>
            </div>
          </div>
          {exercise.content && (
            <CardDescription className="text-base leading-relaxed">
              {exercise.content}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {exercise.exercise_video_url && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Video bài tập</h3>
                {progress?.video_completed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã hoàn thành
                  </Badge>
                )}
              </div>
              
              <SecureVideoPlayer
                src={exercise.exercise_video_url}
                onComplete={handleVideoComplete}
                className="w-full aspect-video rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Yêu cầu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thời gian tối thiểu</span>
                  <Badge variant={timeSpent >= minTime * 60 ? "default" : "secondary"}>
                    {minTime} phút
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Xem video</span>
                  <Badge variant={progress?.video_completed ? "default" : "secondary"}>
                    {progress?.video_completed ? "Hoàn thành" : "Chưa xem"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Video ôn tập cần thiết</span>
                  <Badge variant="outline">
                    {exercise.required_review_videos || 3}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thời gian đã học</span>
                  <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recap đã nộp</span>
                  <Badge variant={progress?.recap_submitted ? "default" : "secondary"}>
                    {progress?.recap_submitted ? "Đã nộp" : "Chưa nộp"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowRecapDialog(true)}
              disabled={!canSubmitRecap || progress?.recap_submitted || isUpdating}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {progress?.recap_submitted ? "Đã nộp Recap" : "Nộp Recap"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <RecapSubmissionDialog
        open={showRecapDialog}
        onOpenChange={setShowRecapDialog}
        onSubmit={handleRecapSubmit}
        exerciseTitle={exercise.title}
        isSubmitting={isUpdating}
      />
    </div>
  );
};

export default ExerciseContent;
