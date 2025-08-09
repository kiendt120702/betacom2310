
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ExerciseContent from "@/components/training/ExerciseContent";
import { useTrainingLogic } from "@/hooks/useTrainingLogic";

const TrainingContentPage = () => {
  const {
    selectedExerciseId,
    selectedExercise,
    orderedExercises,
    isLoading,
    isCompletingExercise,
    isExerciseCompleted,
    isVideoCompleted,
    isRecapSubmitted,
    canCompleteExercise,
    isExerciseUnlocked,
    handleCompleteExercise,
    handleSelectExercise,
  } = useTrainingLogic();

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const handleRecapSubmitted = () => {
    // Refresh data by re-triggering queries
    // The useTrainingLogic hook will handle the state updates
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Danh sách bài tập */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lộ trình đào tạo
          </h2>

          {orderedExercises?.map((exercise, exerciseIndex) => {
            const isActive = exercise.id === selectedExerciseId;
            const exerciseCompleted = isExerciseCompleted(exercise.id);
            const recapSubmitted = isRecapSubmitted(exercise.id);
            const exerciseUnlocked = isExerciseUnlocked(exerciseIndex);

            return (
              <div key={exercise.id} className="relative">
                <div
                  className={cn(
                    "absolute -left-2 top-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg",
                    exerciseCompleted
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-300"
                      : exerciseUnlocked
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-300"
                      : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-2 border-gray-300"
                  )}>
                  {!exerciseUnlocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    exerciseIndex + 1
                  )}
                </div>

                <Card
                  className={cn(
                    "ml-4 transition-colors",
                    isActive && "ring-2 ring-primary",
                    exerciseCompleted && "bg-green-50 border-green-200",
                    exerciseUnlocked
                      ? "cursor-pointer hover:bg-accent"
                      : "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (exerciseUnlocked) {
                      handleSelectExercise(exercise.id);
                    }
                  }}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium line-clamp-2 flex-1">
                          {exercise.title}
                        </h3>
                        {exerciseCompleted && (
                          <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        {exercise.is_required && (
                          <Badge variant="secondary" className="text-xs">
                            Bắt buộc
                          </Badge>
                        )}
                        {!exerciseUnlocked && (
                          <Badge variant="outline" className="text-xs">
                            Chưa mở khóa
                          </Badge>
                        )}
                        {exerciseUnlocked && !exerciseCompleted && (
                          <div className="flex gap-1">
                            {recapSubmitted && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                Recap ✓
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      {selectedExercise ? (
        <ExerciseContent
          exercise={selectedExercise}
          isCompleted={isExerciseCompleted(selectedExercise.id)}
          isVideoCompleted={isVideoCompleted(selectedExercise.id)}
          isRecapSubmitted={isRecapSubmitted(selectedExercise.id)}
          canCompleteExercise={canCompleteExercise(selectedExercise.id)}
          onComplete={handleCompleteExercise}
          onRecapSubmitted={handleRecapSubmitted}
          isCompletingExercise={isCompletingExercise}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <p>Chọn một bài tập để bắt đầu học</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingContentPage;
