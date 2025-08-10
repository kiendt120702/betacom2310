
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useExerciseRecaps } from "@/hooks/useExerciseRecaps";
import { TrainingLayout } from "@/components/training/TrainingLayout";
import ExerciseContent from "@/components/training/ExerciseContent";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const TrainingContentPage = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { data: userProfile } = useUserProfile();
  const { 
    data: exercises = [], 
    isLoading: exercisesLoading 
  } = useEduExercises();
  
  const { 
    completeExercise, 
    isCompletingExercise,
    markRecapSubmitted
  } = useExerciseRecaps();

  if (exercisesLoading) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải bài học...</p>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  if (!exerciseId) {
    return (
      <TrainingLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kiến thức cơ bản</h1>
            <p className="text-muted-foreground mt-2">
              Các bài học kiến thức cơ bản cần thiết cho công việc
            </p>
          </div>

          <div className="grid gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{exercise.title}</CardTitle>
                      {exercise.description && (
                        <CardDescription>{exercise.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exercise.is_required && (
                        <Badge variant="destructive">Bắt buộc</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{exercise.min_completion_time || 5} phút</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{exercise.min_study_sessions} buổi học</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TrainingLayout>
    );
  }

  const exercise = exercises.find(ex => ex.id === exerciseId);

  if (!exercise) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài học</h2>
            <p className="text-muted-foreground">Bài học bạn đang tìm không tồn tại.</p>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  const handleCompleteExercise = async () => {
    if (!userProfile) return;
    
    try {
      await completeExercise.mutateAsync({
        exerciseId: exercise.id,
        userId: userProfile.id
      });
    } catch (error) {
      console.error('Error completing exercise:', error);
    }
  };

  const handleRecapSubmitted = () => {
    markRecapSubmitted(exercise.id);
  };

  return (
    <TrainingLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Bài học: {exercise.title}</h1>
        </div>

        <ExerciseContent
          exercise={exercise}
          onComplete={handleCompleteExercise}
          onRecapSubmitted={handleRecapSubmitted}
          isCompletingExercise={isCompletingExercise}
        />
      </div>
    </TrainingLayout>
  );
};

export default TrainingContentPage;
