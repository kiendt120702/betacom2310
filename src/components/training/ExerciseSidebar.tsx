import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, FileText, Lock, Book, Video, Edit, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingExercise } from "@/types/training";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SelectedPart } from "@/hooks/useTrainingLogic";

interface ExerciseSidebarProps {
  exercises: TrainingExercise[];
  selectedExerciseId: string | null;
  selectedPart: SelectedPart | null;
  onSelect: (exerciseId: string, part: SelectedPart) => void;
  isExerciseCompleted: (exerciseId: string) => boolean;
  isLearningPartCompleted: (exerciseId: string) => boolean;
  isTheoryTestCompleted: (exerciseId: string) => boolean;
  isPracticeCompleted: (exerciseId: string) => boolean;
  isExerciseUnlocked: (index: number) => boolean;
  isLoading: boolean;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  exercises,
  selectedExerciseId,
  selectedPart,
  onSelect,
  isExerciseCompleted,
  isLearningPartCompleted,
  isTheoryTestCompleted,
  isPracticeCompleted,
  isExerciseUnlocked,
  isLoading,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(selectedExerciseId || undefined);

  useEffect(() => {
    setOpenAccordion(selectedExerciseId || undefined);
  }, [selectedExerciseId]);

  const sortedExercises = [...exercises].sort((a, b) => a.order_index - b.order_index);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-muted/10">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b bg-muted/10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lộ trình đào tạo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {sortedExercises.length} bài học
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion} className="w-full p-2">
          {sortedExercises.map((exercise, index) => {
            const isUnlocked = isExerciseUnlocked(index);
            const isCompleted = isExerciseCompleted(exercise.id);
            
            return (
              <AccordionItem value={exercise.id} key={exercise.id} disabled={!isUnlocked}>
                <AccordionTrigger className={cn(
                  "hover:no-underline p-3 rounded-lg",
                  selectedExerciseId === exercise.id && "bg-primary/10"
                )}>
                  <div className="flex items-center gap-3 w-full">
                    {isCompleted ? <CheckCircle className="h-5 w-5 text-green-600" /> : !isUnlocked ? <Lock className="h-5 w-5 text-gray-400" /> : <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</div>}
                    <span className="text-left flex-1">{exercise.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-8 pr-2 space-y-1 py-2">
                    <PartButton
                      label="Học video"
                      icon={Video}
                      isComplete={isLearningPartCompleted(exercise.id)}
                      isActive={selectedExerciseId === exercise.id && selectedPart === 'video'}
                      onClick={() => onSelect(exercise.id, 'video')}
                    />
                    <PartButton
                      label="Kiểm tra lý thuyết"
                      icon={Book}
                      isComplete={isTheoryTestCompleted(exercise.id)}
                      isActive={selectedExerciseId === exercise.id && selectedPart === 'quiz'}
                      onClick={() => onSelect(exercise.id, 'quiz')}
                    />
                    <PartButton
                      label="Nộp video ôn tập"
                      icon={FileUp}
                      isComplete={isPracticeCompleted(exercise.id)}
                      isActive={selectedExerciseId === exercise.id && selectedPart === 'practice'}
                      onClick={() => onSelect(exercise.id, 'practice')}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

const PartButton = ({ label, icon: Icon, isComplete, isActive, onClick }: any) => (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    className="w-full justify-start h-9"
    onClick={onClick}
  >
    {isComplete ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Icon className="h-4 w-4 mr-2 text-muted-foreground" />}
    {label}
  </Button>
);

export default ExerciseSidebar;