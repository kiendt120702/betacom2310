
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EduExercise {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
  order_index: number;
  course_id: string;
  created_at: string;
  updated_at: string;
  estimated_duration?: number;
  exercise_type: 'video' | 'reading' | 'assignment';
  requires_submission: boolean;
}

interface ExerciseSidebarProps {
  exercises: EduExercise[];
  currentExerciseId: string;
  onExerciseSelect: (exerciseId: string) => void;
  userProgress?: Record<string, { completed: boolean; progress_percentage: number }>;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  exercises,
  currentExerciseId,
  onExerciseSelect,
  userProgress = {},
}) => {
  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'assignment': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'reading': return 'Đọc hiểu';
      case 'assignment': return 'Bài tập';
      default: return type;
    }
  };

  const sortedExercises = [...exercises].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Danh sách bài học</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedExercises.map((exercise) => {
          const progress = userProgress[exercise.id];
          const isCompleted = progress?.completed || false;
          const isActive = exercise.id === currentExerciseId;
          const progressPercentage = progress?.progress_percentage || 0;

          return (
            <Button
              key={exercise.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-left",
                isActive && "bg-primary text-primary-foreground",
                !isActive && "hover:bg-muted"
              )}
              onClick={() => onExerciseSelect(exercise.id)}
            >
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getExerciseTypeIcon(exercise.exercise_type)}
                    <span className="font-medium text-sm truncate max-w-[150px]">
                      {exercise.title}
                    </span>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center justify-between w-full text-xs">
                  <Badge variant="outline" className="text-xs">
                    {getExerciseTypeLabel(exercise.exercise_type)}
                  </Badge>
                  
                  {exercise.estimated_duration && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {exercise.estimated_duration}p
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
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
