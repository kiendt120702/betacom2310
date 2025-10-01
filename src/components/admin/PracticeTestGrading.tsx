import React, { useState, useMemo } from "react";
import { useAllPracticeTestSubmissions, PracticeTestSubmissionWithDetails } from "@/hooks/usePracticeTestSubmissions";
import { useEduExercises } from "@/hooks/useEduExercises";
import { TrainingExercise } from "@/types/training";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Edit, FileText } from "lucide-react";
import PracticeExerciseTable from "./PracticeExerciseTable";
import PracticeSubmissionListDialog from "./PracticeSubmissionListDialog";
import GradePracticeTestDialog from "./GradePracticeTestDialog";

const PracticeTestGrading: React.FC = () => {
  const { data: exercises = [], isLoading: exercisesLoading } = useEduExercises();
  const { data: allSubmissions = [], isLoading: submissionsLoading, refetch } = useAllPracticeTestSubmissions();

  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [isSubmissionListOpen, setIsSubmissionListOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PracticeTestSubmissionWithDetails | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const handleViewSubmissions = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setIsSubmissionListOpen(true);
  };

  const handleGradeSubmission = (submission: PracticeTestSubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const handleCloseGradingDialog = () => {
    setIsGradingOpen(false);
    setSelectedSubmission(null);
    refetch(); // Refetch submissions to update the list
  };

  const submissionsForSelectedExercise = useMemo(() => {
    if (!selectedExercise || !Array.isArray(allSubmissions)) return [];
    return allSubmissions.filter(s => s.practice_tests?.exercise_id === selectedExercise.id);
  }, [allSubmissions, selectedExercise]);

  const isLoading = exercisesLoading || submissionsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Chấm bài thực hành
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Đang tải danh sách bài kiểm tra...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Chấm bài thực hành
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Chưa có bài tập nào trong hệ thống.
              <br />
              Vui lòng tạo bài tập trước khi chấm điểm.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Chấm bài thực hành
          </CardTitle>
          <CardDescription>
            Tổng quan về các bài nộp thực hành của học viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PracticeExerciseTable
            exercises={exercises}
            allSubmissions={allSubmissions}
            onViewSubmissions={handleViewSubmissions}
          />
        </CardContent>
      </Card>

      <PracticeSubmissionListDialog
        open={isSubmissionListOpen}
        onClose={() => setIsSubmissionListOpen(false)}
        exercise={selectedExercise}
        submissions={submissionsForSelectedExercise}
        onGradeSubmission={handleGradeSubmission}
      />

      {selectedSubmission && (
        <GradePracticeTestDialog
          submission={selectedSubmission}
          open={isGradingOpen}
          onClose={handleCloseGradingDialog}
        />
      )}
    </>
  );
};

export default PracticeTestGrading;