
import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainingLogic } from "@/hooks/useTrainingLogic";
import ExerciseContent from "@/components/training/ExerciseContent";
import ExerciseSidebar from "@/components/training/ExerciseSidebar";
import { secureLog } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const TrainingContentPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: userProfileLoading } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!userProfileLoading && userProfile?.role !== "học việc/thử việc" && userProfile?.role !== "admin") {
      navigate("/");
    }
  }, [userProfile, userProfileLoading, navigate]);

  if (userProfileLoading || (userProfile?.role !== "học việc/thử việc" && userProfile?.role !== "admin")) {
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
    
    handleCompleteExercise();
    
    queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
    queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
    
    const currentIndex = orderedExercises.findIndex(ex => ex.id === selectedExerciseId);
    const nextExercise = orderedExercises[currentIndex + 1];
    
    if (nextExercise) {
      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (isExerciseUnlocked(nextIndex)) {
          secureLog("Auto-selecting next exercise:", nextExercise.title);
          handleSelectExercise(nextExercise.id);
        }
      }, 1500);
    }
  };

  const handleSelectExerciseWrapper = (exerciseId: string) => {
    handleSelectExercise(exerciseId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
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
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-background border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lộ trình đào tạo
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-muted rounded-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative inset-y-0 left-0 z-50 w-80 
        bg-muted/10 border-r transition-transform duration-300 ease-in-out
        md:w-80 flex-shrink-0
      `}>
        <div className="h-full overflow-y-auto p-4">
          <ExerciseSidebar
            exercises={orderedExercises}
            selectedExerciseId={selectedExerciseId}
            onSelectExercise={handleSelectExerciseWrapper}
            isExerciseCompleted={isExerciseCompleted}
            isExerciseUnlocked={isExerciseUnlocked}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full p-4 md:p-6">
          {selectedExercise ? (
            <ExerciseContent
              exercise={selectedExercise}
              onComplete={handleExerciseComplete}
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-12 h-full">
                <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Chọn bài tập</h2>
                <p className="text-gray-600 text-center">
                  Vui lòng chọn một bài tập từ danh sách để bắt đầu học.
                </p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Xem danh sách bài học
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingContentPage;
