
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, FileText, CheckCircle } from "lucide-react";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import RecapSubmissionDialog from "./RecapSubmissionDialog";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { secureLog } from "@/lib/utils";

interface EduExercise {
  id: string;
  title: string;
  description?: string;
  content?: string;
  exercise_video_url?: string;
  min_completion_time?: number;
  min_study_sessions: number;
  min_review_videos: number;
  required_review_videos: number;
  is_required: boolean;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ExerciseContentProps {
  exercise: EduExercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
}) => {
  const [showRecapDialog, setShowRecapDialog] = useState(false);
  const [isSubmittingRecap, setIsSubmittingRecap] = useState(false);
  const { progress, updateProgress } = useUserExerciseProgress(exercise.id);

  const handleVideoComplete = async () => {
    try {
      await updateProgress({
        video_completed: true,
        time_spent: (progress?.time_spent || 0) + (exercise.min_completion_time || 5),
      });
      secureLog("Video completion marked successfully");
    } catch (error) {
      secureLog("Error marking video complete:", error);
    }
  };

  const handleRecapSubmit = async (content: string) => {
    setIsSubmittingRecap(true);
    try {
      await updateProgress({
        recap_submitted: true,
        notes: content,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
      
      setShowRecapDialog(false);
      onComplete?.();
      secureLog("Recap submitted successfully");
    } catch (error) {
      secureLog("Error submitting recap:", error);
    } finally {
      setIsSubmittingRecap(false);
    }
  };

  const isVideoCompleted = progress?.video_completed || false;
  const isRecapSubmitted = progress?.recap_submitted || false;
  const isExerciseCompleted = progress?.is_completed || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            {exercise.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exercise.description && (
            <p className="text-gray-600">{exercise.description}</p>
          )}

          {exercise.content && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: exercise.content }} />
            </div>
          )}

          {exercise.exercise_video_url && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Video bài tập</h3>
              <SecureVideoPlayer
                videoUrl={exercise.exercise_video_url}
                onComplete={handleVideoComplete}
                className="w-full aspect-video rounded-lg"
              />
              {isVideoCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Video đã hoàn thành</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => setShowRecapDialog(true)}
              disabled={!isVideoCompleted || isRecapSubmitted}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isRecapSubmitted ? "Đã nộp tóm tắt" : "Nộp tóm tắt"}
            </Button>

            {isExerciseCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Bài tập đã hoàn thành</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RecapSubmissionDialog
        isOpen={showRecapDialog}
        onClose={() => setShowRecapDialog(false)}
        onSubmit={handleRecapSubmit}
        exerciseTitle={exercise.title}
        isSubmitting={isSubmittingRecap}
      />
    </div>
  );
};

export default ExerciseContent;
