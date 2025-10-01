import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, FileText, Lock, Book, Video, Edit, FileUp, BookText, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingExercise } from "@/types/training";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SelectedPart } from "@/hooks/useOptimizedTrainingLogic";
import "@/styles/training-interactions.css";

interface OptimizedExerciseSidebarProps {
  exercises: TrainingExercise[];
  selectedExerciseId: string | null;
  selectedPart: SelectedPart | null;
  onSelect: (exerciseId: string, part: SelectedPart) => void;
  progressMap: { [exerciseId: string]: any };
  unlockMap: { [exerciseId: string]: any };
  isLoading: boolean;
}

interface PartConfig {
  key: SelectedPart;
  label: string;
  icon: React.ComponentType<any>;
  getComplete: (progress: any, exercise: TrainingExercise) => boolean;
  isEnabled: (exercise: TrainingExercise) => boolean;
}

const partConfigs: PartConfig[] = [
  {
    key: 'video',
    label: 'Học video',
    icon: Video,
    getComplete: (progress, exercise) => {
      const videoCompleted = exercise.exercise_video_url ? progress?.videoCompleted : true;
      const recapSubmitted = progress?.recapSubmitted || false;
      return videoCompleted && recapSubmitted;
    },
    isEnabled: (exercise) => exercise.has_video,
  },
  {
    key: 'quiz',
    label: 'Kiểm tra lý thuyết',
    icon: Book,
    getComplete: (progress) => progress?.quizPassed || false,
    isEnabled: (exercise) => exercise.has_theory_test,
  },
  {
    key: 'practice',
    label: 'Nộp video ôn tập',
    icon: FileUp,
    getComplete: (progress) => progress?.practiceCompleted || false,
    isEnabled: (exercise) => exercise.has_review_video,
  },
];

const OptimizedExerciseSidebar: React.FC<OptimizedExerciseSidebarProps> = ({
  exercises,
  selectedExerciseId,
  selectedPart,
  onSelect,
  progressMap,
  unlockMap,
  isLoading,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(selectedExerciseId || undefined);

  useEffect(() => {
    setOpenAccordion(selectedExerciseId || undefined);
  }, [selectedExerciseId]);

  const sortedExercises = useMemo(() => 
    [...exercises].sort((a, b) => a.order_index - b.order_index),
    [exercises]
  );

  const handleAccordionChange = (value: string) => {
    setOpenAccordion(value);
    if (value) {
      const exercise = exercises.find(e => e.id === value);
      if (exercise && unlockMap[value]?.exercise) {
        const defaultPart = 'video';
        onSelect(value, defaultPart);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-muted/10">
          <div className="loading-skeleton space-y-2">
            <div className="loading-skeleton-header"></div>
            <div className="loading-skeleton-subheader"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loading-skeleton">
              <div className="loading-skeleton-item"></div>
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

      <div className="flex-1 overflow-y-auto training-sidebar">
        <Accordion 
          type="single" 
          collapsible 
          value={openAccordion} 
          onValueChange={handleAccordionChange} 
          className="w-full p-2"
        >
          {sortedExercises.map((exercise, index) => {
            const isExerciseUnlocked = unlockMap[exercise.id]?.exercise || false;
            const isExerciseCompleted = progressMap[exercise.id]?.isCompleted || false;
            
            const numberBadgeClasses = cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
              !isExerciseUnlocked && "bg-muted text-muted-foreground",
              isExerciseUnlocked && !isExerciseCompleted && "bg-primary/10 text-primary",
              isExerciseCompleted && "bg-primary text-primary-foreground"
            );

            return (
              <AccordionItem 
                value={exercise.id} 
                key={exercise.id}
                className="exercise-accordion-item"
                data-disabled={!isExerciseUnlocked}
              >
                <AccordionTrigger 
                  className="exercise-accordion-trigger"
                  data-disabled={!isExerciseUnlocked}
                  onClick={!isExerciseUnlocked ? (e) => e.preventDefault() : undefined}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={numberBadgeClasses}>{index + 1}</div>
                    <span className="text-left flex-1 truncate">{exercise.title}</span>
                    {!isExerciseUnlocked && <Lock className="h-4 w-4 status-icon-locked flex-shrink-0" />}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-2">
                  <div className="pl-8 pr-2 space-y-1 py-2">
                    {partConfigs
                      .filter(part => part.isEnabled(exercise))
                      .map((config) => {
                        const isPartUnlocked = unlockMap[exercise.id]?.[config.key] || false;
                        const isPartCompleted = config.getComplete(progressMap[exercise.id] || {}, exercise);
                        const isPartActive = selectedExerciseId === exercise.id && selectedPart === config.key;

                        return (
                          <PartButton
                            key={config.key}
                            label={config.label}
                            icon={config.icon}
                            isComplete={isPartCompleted}
                            isActive={isPartActive}
                            isUnlocked={isPartUnlocked}
                            onClick={() => onSelect(exercise.id, config.key)}
                          />
                        );
                      })}
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

interface PartButtonProps {
  label: string;
  icon: React.ComponentType<any>;
  isComplete: boolean;
  isActive: boolean;
  isUnlocked: boolean;
  onClick: () => void;
}

const PartButton = React.memo<PartButtonProps>(({ 
  label, 
  icon: Icon, 
  isComplete, 
  isActive, 
  isUnlocked, 
  onClick 
}) => {
  const handleClick = () => {
    if (isUnlocked && onClick) {
      onClick();
    }
  };

  return (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    size="sm"
    className="part-button"
    data-active={isActive}
    onClick={handleClick}
    disabled={!isUnlocked}
  >
    <div className="part-button-content">
      {isComplete ? (
        <CheckCircle className="part-button-icon status-icon-completed" />
      ) : !isUnlocked ? (
        <Lock className="part-button-icon status-icon-locked" />
      ) : (
        <Icon className="part-button-icon status-icon-available" />
      )}
      <span className="part-button-label">{label}</span>
    </div>
  </Button>
  );
});

PartButton.displayName = 'PartButton';

export default OptimizedExerciseSidebar;