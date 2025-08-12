import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainingLogic } from "@shared/hooks/useTrainingLogic";
import ExerciseContent from "@/components/training/ExerciseContent";
import ExerciseSidebar from "@/components/training/ExerciseSidebar";
import { secureLog } from "@shared/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "@shared/hooks/useUserProfile"; // Import useUserProfile
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect } from "react";

const TrainingContentPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: userProfileLoading } = useUserProfile(); // Lấy thông tin user profile

  useEffect(() => {
    if (!userProfileLoading && userProfile?.role !== "học việc/thử việc") {
      navigate("/"); // Chuyển hướng về trang chủ nếu không có quyền
    }
  }, [userProfile, userProfileLoading, navigate]);

  if (userProfileLoading || userProfile?.role !== "học việc/thử việc") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }
  
  const {
    selectedExercise,
    orderedExercises,
    isLoading,
    isExerciseCompleted,
    isExerciseUnlocked,
    handleSelectExercise,
    handleCompleteExercise,
    selectedExerciseId,
  } = useTrainingLogic();

  const handleExerciseComplete = () => {
    secureLog("Exercise completed successfully");
    
    // Call the training logic completion handler
    handleCompleteExercise();
    
    // Invalidate all related queries to ensure real-time updates
    queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
    queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
    
    // Find the next available exercise
    const currentIndex = orderedExercises.findIndex(ex => ex.id === selectedExerciseId);
    const nextExercise = orderedExercises[currentIndex + 1];
    
    // Auto-select next exercise if available and unlocked
    if (nextExercise) {
      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (isExerciseUnlocked(nextIndex)) {
          secureLog("Auto-selecting next exercise:", nextExercise.title);
          handleSelectExercise(nextExercise.id);
        }
      }, 1500); // Slightly longer delay to ensure database updates propagate
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!orderedExercises || orderedExercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chưa có bài tập nào</h2>
            <p className="text-gray-600 text-center">
              Hiện tại chưa có bài tập nào được tạo. Vui lòng liên hệ quản trị viên.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <div className="border-r bg-muted/10 p-4">
        <ExerciseSidebar
          exercises={orderedExercises}
          selectedExerciseId={selectedExerciseId}
          onSelectExercise={handleSelectExercise}
          isExerciseCompleted={isExerciseCompleted}
          isExerciseUnlocked={isExerciseUnlocked}
          isLoading={isLoading}
        />
      </div>
      
      <main className="flex-1 overflow-y-auto p-6">
        {selectedExercise ? (
          <ExerciseContent
            exercise={selectedExercise}
            onComplete={handleExerciseComplete}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Chọn bài tập</h2>
              <p className="text-gray-600 text-center">
                Vui lòng chọn một bài tập từ danh sách bên trái để bắt đầu học.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TrainingContentPage;