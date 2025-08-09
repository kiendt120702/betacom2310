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
          <h2 className="font-semibold">Lộ trình đào tạo</h2>
        </header>

        <nav role="navigation" aria-label="Danh sách bài tập">
          {exercises.map((exercise, exerciseIndex) => {
            const isActive = exercise.id === selectedExerciseId;
            const exerciseCompleted = isExerciseCompleted(exercise.id);
            const exerciseUnlocked = isExerciseUnlocked(exerciseIndex);

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                stepNumber={exerciseIndex + 1}
                isActive={isActive}
                isCompleted={exerciseCompleted}
                isUnlocked={exerciseUnlocked}
                onClick={() => exerciseUnlocked && onSelectExercise(exercise.id)}
              />
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

interface ExerciseCardProps {
  exercise: EduExercise;
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  onClick: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  stepNumber,
  isActive,
  isCompleted,
  isUnlocked,
  onClick,
}) => {
  return (
    <div className="relative">
      {/* Step Number Circle */}
      <div
        className={cn(
          "absolute -left-2 top-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10",
          isCompleted
            ? "bg-green-500 text-white"
            : isUnlocked
            ? "bg-primary text-primary-foreground"
            : "bg-gray-400 text-white"
        )}
        aria-hidden="true"
      >
        {isCompleted ? (
          <CheckCircle className="h-4 w-4" />
        ) : !isUnlocked ? (
          <Lock className="h-3 w-3" />
        ) : (
          stepNumber
        )}
      </div>

      {/* Exercise Card */}
      <Card
        className={cn(
          "ml-4 transition-colors",
          isActive && "ring-2 ring-primary",
          isCompleted && "bg-green-50 border-green-200",
          isUnlocked
            ? "cursor-pointer hover:bg-accent"
            : "opacity-60 cursor-not-allowed"
        )}
        onClick={onClick}
        role="button"
        tabIndex={isUnlocked ? 0 : -1}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isUnlocked) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`Bài tập ${stepNumber}: ${exercise.title}${
          isCompleted ? ' - Đã hoàn thành' : isUnlocked ? ' - Có thể học' : ' - Chưa mở khóa'
        }`}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium line-clamp-2 flex-1">
                {exercise.title}
              </h3>
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-green-500" aria-label="Đã hoàn thành" />
              )}
              {!isUnlocked && (
                <Lock className="h-4 w-4 text-gray-400" aria-label="Chưa mở khóa" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {exercise.is_required && (
                <Badge variant="secondary" className="text-xs">
                  Bắt buộc
                </Badge>
              )}
              {!isUnlocked && (
                <Badge variant="outline" className="text-xs">
                  Chưa mở khóa
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseSidebar;