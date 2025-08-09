
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTrainingCourses,
  useTrainingVideos,
  useUserCourseProgress,
  useVideoProgress,
} from "@/hooks/useTrainingCourses";
import { useEduExercises, useUserExerciseProgress, useUpdateExerciseProgress } from "@/hooks/useEduExercises";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  Video,
  CheckCircle,
  ChevronLeft,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TrainingContentPage = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get('exercise');
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [startTime, setStartTime] = useState<number>();

  const { user } = useAuth();
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: userExerciseProgress } = useUserExerciseProgress();
  const { mutate: updateExerciseProgress } = useUpdateExerciseProgress();

  // Sắp xếp exercises theo order_index
  const orderedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];
  
  // Find selected exercise
  const selectedExercise = exercises?.find(e => e.id === selectedExerciseId);
  
  // Check if exercise is completed
  const isExerciseCompleted = (exerciseId: string) => {
    return userExerciseProgress?.some(progress => 
      progress.exercise_id === exerciseId && progress.is_completed
    ) || false;
  };

  // Check if exercise is unlocked (first exercise is always unlocked, others require previous to be completed)
  const isExerciseUnlocked = (exerciseIndex: number) => {
    if (exerciseIndex === 0) return true;
    
    const previousExercise = orderedExercises[exerciseIndex - 1];
    return previousExercise ? isExerciseCompleted(previousExercise.id) : false;
  };

  // Auto-select first unlocked exercise if none selected
  React.useEffect(() => {
    if (!selectedExerciseId && orderedExercises.length > 0) {
      // Find first incomplete exercise or first exercise
      const firstIncomplete = orderedExercises.find((ex, index) => 
        isExerciseUnlocked(index) && !isExerciseCompleted(ex.id)
      );
      setSelectedExerciseId(firstIncomplete?.id || orderedExercises[0].id);
    }
  }, [orderedExercises, selectedExerciseId, userExerciseProgress]);

  const handleCompleteExercise = () => {
    if (!selectedExerciseId) return;
    
    updateExerciseProgress({
      exercise_id: selectedExerciseId,
      is_completed: true,
      time_spent: Math.floor((Date.now() - (startTime || Date.now())) / 60000), // Convert to minutes
    });
  };

  React.useEffect(() => {
    if (selectedExerciseId && !startTime) {
      setStartTime(Date.now());
    }
  }, [selectedExerciseId]);

  if (exercisesLoading) {
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
            const exerciseUnlocked = isExerciseUnlocked(exerciseIndex);

            return (
              <div key={exercise.id} className="relative">
                <div className={cn(
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
                    "ml-4 transition-colors",
                    isActive && "ring-2 ring-primary",
                    exerciseCompleted && "bg-green-50 border-green-200",
                    exerciseUnlocked ? "cursor-pointer hover:bg-accent" : "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (exerciseUnlocked) {
                      setSelectedExerciseId(exercise.id);
                    }
                  }}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium line-clamp-2 flex-1">{exercise.title}</h3>
                        {exerciseCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {!exerciseUnlocked && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {exercise.is_required && (
                          <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
                        )}
                        {!exerciseUnlocked && (
                          <Badge variant="outline" className="text-xs">Chưa mở khóa</Badge>
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
      <div className="flex-1 overflow-y-auto">
        {selectedExercise ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronLeft className="h-4 w-4" />
                <span>Bài tập kiến thức</span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{selectedExercise.title}</h1>
                {isExerciseCompleted(selectedExercise.id) && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Hoàn thành
                  </Badge>
                )}
              </div>
            </div>

            {/* Exercise Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Nội dung bài học
                </CardTitle>
                <CardDescription>
                  Video bài học cho bài tập này
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedExercise.exercise_video_url ? (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "bg-black rounded-lg overflow-hidden relative",
                        "aspect-video w-full max-w-4xl mx-auto"
                      )}>
                      <video
                        className="w-full h-full object-contain"
                        controls
                        preload="metadata"
                        poster=""
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}>
                        <source src={selectedExercise.exercise_video_url} type="video/mp4" />
                        <source src={selectedExercise.exercise_video_url} type="video/webm" />
                        <source src={selectedExercise.exercise_video_url} type="video/quicktime" />
                        Trình duyệt của bạn không hỗ trợ video HTML5.
                      </video>

                      {/* Multiple watermarks */}
                      <div className="absolute top-4 right-4 bg-black/30 text-white text-xs px-2 py-1 rounded pointer-events-none">
                        © Nội bộ công ty
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/30 text-white text-xs px-2 py-1 rounded pointer-events-none">
                        Bảo mật - Không tải xuống
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-4xl font-bold pointer-events-none select-none">
                        NỘI BỘ
                      </div>

                      {/* Invisible overlay to prevent right-click */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          return false;
                        }}
                        style={{
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Xem video bài học và hoàn thành để mở khóa bài tập tiếp theo.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có video bài học cho bài tập này.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complete Exercise Button */}
            {!isExerciseCompleted(selectedExercise.id) && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleCompleteExercise}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Hoàn thành bài tập
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Chọn một bài tập để bắt đầu học</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingContentPage;
