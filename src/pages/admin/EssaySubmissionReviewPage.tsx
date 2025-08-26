import React, { useState, useMemo } from "react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useAllEssaySubmissions, EssaySubmissionWithDetails } from "@/hooks/useEssaySubmissions";
import { TrainingExercise } from "@/types/training";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import EssayExerciseTable from "@/components/admin/EssayExerciseTable";
import EssaySubmissionListDialog from "@/components/admin/EssaySubmissionListDialog";
import GradeEssayDialog from "@/components/admin/GradeEssayDialog";

const EssaySubmissionReviewPage: React.FC = () => {
  const { data: exercises = [], isLoading: exercisesLoading } = useEduExercises();
  const { data: allSubmissions = [], isLoading: submissionsLoading, refetch } = useAllEssaySubmissions();

  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [isSubmissionListOpen, setIsSubmissionListOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<EssaySubmissionWithDetails | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const handleViewSubmissions = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setIsSubmissionListOpen(true);
  };

  const handleGradeSubmission = (submission: EssaySubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const handleCloseGradingDialog = () => {
    setIsGradingOpen(false);
    setSelectedSubmission(null);
    refetch(); // Refetch submissions to update the list
  };

  const submissionsForSelectedExercise = useMemo(() => {
    if (!selectedExercise) return [];
    return allSubmissions.filter(s => s.exercise_id === selectedExercise.id);
  }, [allSubmissions, selectedExercise]);

  const isLoading = exercisesLoading || submissionsLoading;

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chấm bài tự luận
          </CardTitle>
          <CardDescription>
            Tổng quan và chấm điểm các bài tập tự luận của học viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EssayExerciseTable
            exercises={exercises}
            allSubmissions={allSubmissions}
            onViewSubmissions={handleViewSubmissions}
          />
        </CardContent>
      </Card>

      <EssaySubmissionListDialog
        open={isSubmissionListOpen}
        onClose={() => setIsSubmissionListOpen(false)}
        exercise={selectedExercise}
        submissions={submissionsForSelectedExercise}
        onGradeSubmission={handleGradeSubmission}
      />

      {selectedSubmission && (
        <GradeEssayDialog
          submission={selectedSubmission}
          open={isGradingOpen}
          onClose={handleCloseGradingDialog}
        />
      )}
    </>
  );
};

export default EssaySubmissionReviewPage;