import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainingLogic } from "@/hooks/useTrainingLogic";
import ExerciseContent from "@/components/training/ExerciseContent";
import ExerciseSidebar from "@/components/training/ExerciseSidebar";
import { secureLog, cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContentProtection } from "@/hooks/useContentProtection";

const TrainingContentPage = () => {
  useContentProtection();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
    <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-background border-b px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Lộ trình đào tạo
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 w-full max-w-sm md:max-w-none md:w-80 bg-background border-r",
        "transform transition-transform duration-300 ease-in-out md:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "flex-shrink-0 md:shadow-none shadow-xl",
        // Ensure full height and proper overflow handling
        "h-full md:h-auto"
      )}>
        <ExerciseSidebar
          exercises={orderedExercises}
          selectedExerciseId={selectedExerciseId}
          onSelectExercise={handleSelectExerciseWrapper}
          isExerciseCompleted={isExerciseCompleted}
          isExerciseUnlocked={isExerciseUnlocked}
          isLoading={isLoading}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {selectedExercise ? (
            <div className="p-4 md:p-6">
              <ExerciseContent
                exercise={selectedExercise}
                onComplete={handleExerciseComplete}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Chọn bài tập</h2>
                  <p className="text-muted-foreground mb-4">
                    Vui lòng chọn một bài tập từ danh sách để bắt đầu học.
                  </p>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Xem danh sách bài học
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingContentPage;