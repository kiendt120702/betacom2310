import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingExercise } from "@/types/training"; // Import TrainingExercise

interface ExerciseSidebarProps {
  exercises: TrainingExercise[]; // Use TrainingExercise[]
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

  const getExerciseStatus = (exercise: TrainingExercise, index: number) => { // Use TrainingExercise
    const isCompleted = isExerciseCompleted(exercise.id);
    const isUnlocked = isExerciseUnlocked(index);
    
    if (isCompleted) {
      return { 
        status: 'completed', 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        label: 'Đã hoàn thành'
      };
    } else if (isUnlocked) {
      return { 
        status: 'available', 
        color: 'bg-blue-100 text-blue-800', 
        icon: <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</div>,
        label: 'Có thể học'
      };
    } else {
      return { 
        status: 'locked', 
        color: 'bg-gray-100 text-gray-500', 
        icon: <Lock className="h-4 w-4 text-gray-400" />,
        label: 'Chưa mở khóa'
      };
    }
  };

  const sortedExercises = [...exercises].sort((a, b) => a.order_index - b.order_index);

  if (isLoading) {
    return (
      <Card className="w-80 h-fit">
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lộ trình đào tạo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[calc(100vh-150px)] overflow-y-auto">
        {sortedExercises.map((exercise, index) => {
          const isActive = exercise.id === selectedExerciseId;
          const status = getExerciseStatus(exercise, index);
          const isUnlocked = isExerciseUnlocked(index);

          return (
            <Button
              key={exercise.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-left border border-border rounded-lg mb-2", // Added border, rounded-lg, mb-2
                isActive && "bg-primary text-primary-foreground",
                !isActive && "hover:bg-muted",
                !isUnlocked && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => isUnlocked && onSelectExercise(exercise.id)}
              disabled={!isUnlocked}
            >
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <span className="font-medium text-sm truncate max-w-[180px]">
                      {exercise.title}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full text-xs">
                  <Badge variant="outline" className={cn("text-xs", status.color)}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ExerciseSidebar;