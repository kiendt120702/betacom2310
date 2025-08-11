import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EduExercise } from "@/hooks/useEduExercises";

interface ExerciseSidebarProps {
  exercises: EduExercise[];
  selectedExerciseId: string | null;
  onSelectExercise: (exerciseId: string) => void;
  isExerciseCompleted: (exerciseId: string) => boolean;
  isExerciseUnlocked: (exerciseIndex: number) => boolean;
  isLoading?: boolean;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  isExerciseCompleted,
  isExerciseUnlocked,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <aside className="w-80 border-r bg-muted/30 p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
      <div className="space-y-4">
        <header className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <h2 className="font-semibold">Danh sách bài tập</h2>
        </header>

        <nav role="navigation" aria-label="Danh sách bài tập">
          {exercises.map((exercise, exerciseIndex) => {
            const isActive = exercise.id === selectedExerciseId;
            const exerciseCompleted = isExerciseCompleted(exercise.id);
            const exerciseUnlocked = isExerciseUnlocked(exerciseIndex);

            return (
              <div key={exercise.id} className="relative">
                <div
                  className={cn(
                    "absolute -left-2 top-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10",
                    exerciseCompleted
                      ? "bg-green-500 text-white"
                      : exerciseUnlocked
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-400 text-white"
                  )}>
                  {exerciseCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : !exerciseUnlocked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    exerciseIndex + 1
                  )}
                </div>

                <Card
                  className={cn(
                    "ml-4 transition-all duration-200",
                    isActive && "ring-2 ring-primary shadow-md",
                    exerciseCompleted && "bg-green-50 border-green-200",
                    exerciseUnlocked
                      ? "cursor-pointer hover:bg-accent hover:shadow-sm"
                      : "opacity-50 cursor-not-allowed bg-gray-50",
                    !exerciseUnlocked && "border-gray-200"
                  )}
                  onClick={() => {
                    if (exerciseUnlocked) {
                      onSelectExercise(exercise.id);
                    }
                  }}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <h3 className="font-medium text-sm line-clamp-2 flex-1 leading-5">
                          {exercise.title}
                        </h3>
                        {exerciseCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" aria-label="Đã hoàn thành" />
                        )}
                        {!exerciseUnlocked && (
                          <Lock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" aria-label="Chưa mở khóa" />
                        )}
                      </div>

                      {exercise.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {exercise.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {exerciseCompleted && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Đã hoàn thành
                            </Badge>
                          )}
                          {!exerciseUnlocked && (
                            <Badge variant="secondary" className="text-xs">
                              Chờ mở khóa
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </nav>

        {exercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" aria-hidden="true" />
            <p>Chưa có bài tập nào được thiết lập</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ExerciseSidebar;