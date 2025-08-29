import React, { useState, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainingLogic, SelectedPart } from "@/hooks/useTrainingLogic";
import ExerciseContent from "@/components/training/ExerciseContent";
import OptimizedExerciseSidebar from "@/components/training/OptimizedExerciseSidebar";
import { secureLog, cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useContentProtection } from "@/hooks/useContentProtection";
import QuizView from "@/components/training/QuizView";
import PracticeView from "@/components/training/PracticeView";
import PracticeTestView from "@/components/training/PracticeTestView";

const TrainingContentPage = () => {
  useContentProtection();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    selectedExercise,
    selectedPart,
    orderedExercises,
    isLoading,
    isExerciseCompleted,
    isLearningPartCompleted,
    isVideoCompleted,
    isTheoryTestCompleted,
    isPracticeCompleted,
    isPracticeTestCompleted,
    isExerciseUnlocked,
    isPartUnlocked,
    handleSelect,
    handleCompleteExercise,
    selectedExerciseId,
  } = useTrainingLogic();

  // Create compatibility maps for the optimized sidebar
  const progressMap = useMemo(() => {
    const map: any = {};
    orderedExercises.forEach(exercise => {
      map[exercise.id] = {
        isCompleted: isExerciseCompleted(exercise.id),
        videoCompleted: isVideoCompleted(exercise.id),
        quizPassed: isTheoryTestCompleted(exercise.id),
        practiceCompleted: isPracticeCompleted(exercise.id),
        practiceTestCompleted: isPracticeTestCompleted(exercise.id),
      };
    });
    return map;
  }, [orderedExercises, isExerciseCompleted, isVideoCompleted, isTheoryTestCompleted, isPracticeCompleted, isPracticeTestCompleted]);

  const unlockMap = useMemo(() => {
    const map: any = {};
    orderedExercises.forEach((exercise, index) => {
      const isExerciseUnlockedValue = isExerciseUnlocked(index);
      map[exercise.id] = {
        exercise: isExerciseUnlockedValue,
        video: isPartUnlocked ? isPartUnlocked(exercise.id, 'video') : isExerciseUnlockedValue,
        quiz: isPartUnlocked ? isPartUnlocked(exercise.id, 'quiz') : isExerciseUnlockedValue,
        practice: isPartUnlocked ? isPartUnlocked(exercise.id, 'practice') : isExerciseUnlockedValue,
        practice_test: isPartUnlocked ? isPartUnlocked(exercise.id, 'practice_test') : isExerciseUnlockedValue,
      };
    });
    return map;
  }, [orderedExercises, isExerciseUnlocked, isPartUnlocked]);

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
          handleSelect(nextExercise.id, 'video');
        }
      }, 1500);
    }
  };

  const handleSelectWrapper = (exerciseId: string, part: SelectedPart) => {
    console.log('Selecting exercise:', exerciseId, 'part:', part);
    console.log('Unlock status:', unlockMap[exerciseId]?.[part]);
    handleSelect(exerciseId, part);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    if (!selectedExercise) {
      return (
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
      );
    }

    switch (selectedPart) {
      case 'video':
        return <ExerciseContent exercise={selectedExercise} onComplete={handleExerciseComplete} isLearningPartCompleted={isLearningPartCompleted(selectedExercise.id)} />;
      case 'quiz':
        return <QuizView exercise={selectedExercise} onQuizCompleted={() => {
          // When theory test is completed, mark exercise as completed to unlock next exercise
          if (selectedExercise) {
            queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
            queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
          }
        }} />;
      case 'practice':
        return <PracticeView exercise={selectedExercise} />;
      case 'practice_test':
        return <PracticeTestView exercise={selectedExercise} />;
      default:
        return <ExerciseContent exercise={selectedExercise} onComplete={handleExerciseComplete} isLearningPartCompleted={isLearningPartCompleted(selectedExercise.id)} />;
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

      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 w-full max-w-sm md:max-w-none md:w-80 bg-background border-r",
        "transform transition-transform duration-300 ease-in-out md:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "flex-shrink-0 md:shadow-none shadow-xl",
        "h-full md:h-auto"
      )}>
        <OptimizedExerciseSidebar
          exercises={orderedExercises}
          selectedExerciseId={selectedExerciseId}
          selectedPart={selectedPart}
          onSelect={handleSelectWrapper}
          progressMap={progressMap}
          unlockMap={unlockMap}
          isLoading={isLoading}
        />
      </div>

      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 md:p-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainingContentPage;