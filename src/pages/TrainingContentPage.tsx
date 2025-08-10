
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, BookOpen, ArrowLeft } from 'lucide-react';
import { useEduExercises } from '@/hooks/useEduExercises';
import TrainingLayout from '@/components/training/TrainingLayout';
import ExerciseContent from '@/components/training/ExerciseContent';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';
import { useToast } from '@/hooks/use-toast';

const TrainingContentPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(false);
  
  const { data: exercises, isLoading } = useEduExercises();

  const exercise = exercises?.find(ex => ex.id === exerciseId);
  
  const {
    data: progress,
    markExerciseComplete,
    isUpdating
  } = useUserExerciseProgress(exerciseId!);

  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </TrainingLayout>
    );
  }

  if (!exercise) {
    return <Navigate to="/training" replace />;
  }

  const handleStartExercise = () => {
    setShowContent(true);
  };

  const handleExerciseComplete = async () => {
    try {
      await markExerciseComplete();
      toast({
        title: "Hoàn thành!",
        description: "Bạn đã hoàn thành bài tập này.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái bài tập.",
        variant: "destructive",
      });
    }
  };

  const handleRecapSubmit = () => {
    toast({
      title: "Thành công!",
      description: "Recap của bạn đã được gửi thành công.",
    });
  };

  if (showContent) {
    return (
      <TrainingLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowContent(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại thông tin bài tập
            </Button>
          </div>
          
          <ExerciseContent
            exercise={{
              id: exercise.id,
              title: exercise.title,
              content: exercise.content || undefined,
              exercise_video_url: exercise.exercise_video_url || undefined,
              min_completion_time: exercise.min_completion_time || undefined,
              required_review_videos: exercise.required_review_videos || 3,
            }}
            onExerciseComplete={handleExerciseComplete}
            onRecapSubmit={handleRecapSubmit}
          />
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{exercise.title}</CardTitle>
                {exercise.content && (
                  <CardDescription className="text-lg">
                    {exercise.content}
                  </CardDescription>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {progress?.is_completed && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Đã hoàn thành
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Thời gian tối thiểu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-2xl font-bold">
                      {exercise.min_completion_time || 5} phút
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Video ôn tập
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    <span className="text-2xl font-bold">
                      {exercise.required_review_videos || 3}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={progress?.is_completed ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {progress?.is_completed ? "Hoàn thành" : "Chưa bắt đầu"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                onClick={handleStartExercise}
                size="lg"
                disabled={isUpdating}
                className="px-8 py-3 text-lg"
              >
                {progress?.is_completed ? "Xem lại bài tập" : "Bắt đầu bài tập"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TrainingLayout>
  );
};

export default TrainingContentPage;
