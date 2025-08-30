import React, { useState, useEffect } from "react";
import { useGeneralTraining, GeneralTrainingExercise } from "@/hooks/useGeneralTraining";
import GeneralTrainingContentPage from "./GeneralTrainingContentPage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const GeneralTrainingPage = () => {
  const { data: exercises, isLoading } = useGeneralTraining();
  const [selectedExercise, setSelectedExercise] = useState<GeneralTrainingExercise | null>(null);
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const orderedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  useEffect(() => {
    if (orderedExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(orderedExercises[0]);
    }
  }, [orderedExercises, selectedExercise]);

  const handleSelectExercise = (exercise: GeneralTrainingExercise) => {
    setSelectedExercise(exercise);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b bg-muted/10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Đào tạo Chung
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {orderedExercises.length} bài học
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          orderedExercises.map((ex, index) => (
            <Button
              key={ex.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-3 px-3 text-left transition-all duration-200 rounded-lg",
                selectedExercise?.id === ex.id 
                  ? "bg-primary/10 border-primary/50 border" 
                  : "hover:bg-muted/50"
              )}
              onClick={() => handleSelectExercise(ex)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  selectedExercise?.id === ex.id 
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 text-left">
                  <p className={cn(
                    "font-medium text-sm leading-tight",
                    selectedExercise?.id === ex.id ? "text-primary" : "text-foreground"
                  )}>{ex.title}</p>
                </div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {isMobile && (
        <div className="bg-background border-b px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Đào tạo Chung
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      )}

      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 w-full max-w-sm md:max-w-none md:w-80 bg-background border-r",
        "transform transition-transform duration-300 ease-in-out md:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "flex-shrink-0 md:shadow-none shadow-xl",
        "h-full md:h-auto"
      )}>
        <SidebarContent />
      </div>

      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <GeneralTrainingContentPage 
            exercise={selectedExercise} 
            onBack={() => {}} 
          />
        </div>
      </main>
    </div>
  );
};

export default GeneralTrainingPage;