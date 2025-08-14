
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingExercise } from "@/types/training";

interface ExerciseSidebarProps {
  exercises: TrainingExercise[];
  selectedExerciseId: string | null;
  onSelectExercise: (exerciseId: string) => void;
  isExerciseCompleted: (exerciseId: string) => boolean;
  isExerciseUnlocked: (index: number) => boolean;
  isLoading: boolean;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  isExerciseCompleted,
  isExerciseUnlocked,
  isLoading,
}) => {
  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'assignment': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getExerciseStatus = (exercise: TrainingExercise, index: number) => {
    const isCompleted = isExerciseCompleted(exercise.id);
    const isUnlocked = isExerciseUnlocked(index);
    
    if (isCompleted) {
      return { 
        status: 'completed', 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        label: 'Đã hoàn thành',
        cardColor: 'bg-green-50/50 border-green-200'
      };
    } else if (isUnlocked) {
      return { 
        status: 'available', 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</div>,
        label: 'Có thể học',
        cardColor: 'bg-blue-50/30 border-blue-200'
      };
    } else {
      return { 
        status: 'locked', 
        color: 'bg-gray-50 text-gray-600 border-gray-200', 
        icon: <Lock className="h-5 w-5 text-gray-400" />,
        label: 'Chưa mở khóa',
        cardColor: 'bg-gray-50/50 border-gray-200'
      };
    }
  };

  const sortedExercises = [...exercises].sort((a, b) => a.order_index - b.order_index);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-4 border-b bg-muted/10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lộ trình đào tạo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {sortedExercises.length} bài học
        </p>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedExercises.map((exercise, index) => {
          const isActive = exercise.id === selectedExerciseId;
          const status = getExerciseStatus(exercise, index);
          const isUnlocked = isExerciseUnlocked(index);

          return (
            <div
              key={exercise.id}
              className={cn(
                "relative rounded-xl border-2 transition-all duration-200",
                isActive ? "border-primary bg-primary/5 shadow-md" : status.cardColor,
                isUnlocked ? "cursor-pointer hover:shadow-lg hover:scale-[1.02]" : "opacity-60",
                "group"
              )}
              onClick={() => isUnlocked && onSelectExercise(exercise.id)}
            >
              {/* Selected indicator */}
              {isActive && (
                <div className="absolute -left-1 top-4 bottom-4 w-1 bg-primary rounded-r-full"></div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {status.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-medium text-sm leading-5 mb-2",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {exercise.title}
                    </h3>

                    {/* Status Badge */}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-medium border",
                        status.color
                      )}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover effect */}
              {isUnlocked && (
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseSidebar;
