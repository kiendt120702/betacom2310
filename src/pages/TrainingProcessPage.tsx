
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEduExercises, useUserExerciseProgress } from "@/hooks/useEduExercises";
import { BookOpen, Clock, ChevronRight, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const TrainingProcessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: exercises, isLoading, error } = useEduExercises();
  const { data: userProgress } = useUserExerciseProgress();

  // Sắp xếp các bài tập theo order_index
  const orderedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  // Helper function để check xem bài tập đã hoàn thành chưa
  const isExerciseCompleted = (exerciseId: string) => {
    return userProgress?.some(progress => 
      progress.exercise_id === exerciseId && progress.is_completed
    ) || false;
  };

  // Helper function để check xem bài tập có được mở khóa không
  const isExerciseUnlocked = (exerciseIndex: number) => {
    if (exerciseIndex === 0) return true; // Bài đầu tiên luôn mở khóa
    
    // Kiểm tra bài trước đó đã hoàn thành chưa
    const previousExercise = orderedExercises[exerciseIndex - 1];
    return previousExercise ? isExerciseCompleted(previousExercise.id) : false;
  };

  const handleStartExercise = (exerciseId: string) => {
    navigate(`/training-content?exercise=${exerciseId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy trình đào tạo</h1>
        <p className="text-muted-foreground">
          Các bước đào tạo cần thực hiện theo thứ tự
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lộ trình học tập
          </CardTitle>
          <CardDescription>
            Hoàn thành các bài tập kiến thức theo thứ tự từ 1 đến {orderedExercises.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderedExercises.length > 0 ? (
            orderedExercises.map((exercise, index) => (
              <TrainingStep 
                key={exercise.id} 
                exercise={exercise} 
                stepNumber={index + 1}
                isCompleted={isExerciseCompleted(exercise.id)}
                isUnlocked={isExerciseUnlocked(index)}
                isLast={index === orderedExercises.length - 1}
                onStart={() => handleStartExercise(exercise.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Chưa có quy trình đào tạo nào được thiết lập</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Component cho mỗi bước đào tạo
interface TrainingStepProps {
  exercise: {
    id: string;
    title: string;
    description: string | null;
    min_completion_time: number | null;
    is_required: boolean;
  };
  stepNumber: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isLast: boolean;
  onStart: () => void;
}

const TrainingStep: React.FC<TrainingStepProps> = ({ 
  exercise, 
  stepNumber, 
  isCompleted,
  isUnlocked,
  isLast,
  onStart 
}) => {
  return (
    <div className="relative">
      <div className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
        isUnlocked ? "hover:bg-muted/50" : "opacity-60",
        isCompleted && "bg-green-50 border-green-200"
      )}>
        {/* Step Number */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
          isCompleted 
            ? "bg-green-500 text-white" 
            : isUnlocked
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        )}>
          {isCompleted ? <CheckCircle className="h-4 w-4" /> : 
           !isUnlocked ? <Lock className="h-4 w-4" /> : 
           stepNumber}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{exercise.title}</h3>
                {isCompleted && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    Hoàn thành
                  </Badge>
                )}
                {exercise.is_required && (
                  <Badge variant="secondary" className="text-xs">
                    Bắt buộc
                  </Badge>
                )}
              </div>
              {exercise.description && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {exercise.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                {exercise.min_completion_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Tối thiểu {exercise.min_completion_time} phút</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex items-center gap-2">
              {isUnlocked && !isCompleted && (
                <Button onClick={onStart} className="bg-primary hover:bg-primary/90">
                  Bắt đầu học
                </Button>
              )}
              {isCompleted && (
                <Button onClick={onStart} variant="outline">
                  Ôn tập lại
                </Button>
              )}
              {!isUnlocked && (
                <Badge variant="outline" className="text-xs">
                  Chưa mở khóa
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Arrow to next step */}
        {!isLast && (
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
        )}
      </div>
      
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-4 bg-border" />
      )}
    </div>
  );
};

export default TrainingProcessPage;
