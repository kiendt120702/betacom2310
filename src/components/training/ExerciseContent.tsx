
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Video } from "lucide-react";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";
import { RecapSubmissionDialog } from "./RecapSubmissionDialog";

export interface EduExercise {
  id: string;
  title: string;
  content?: string;
  description?: string;
  min_completion_time?: number;
  exercise_video_url?: string;
  order_index: number;
  is_required: boolean;
  min_study_sessions: number;
  min_review_videos: number;
  required_review_videos: number;
}

interface ExerciseContentProps {
  exercise: EduExercise;
  onComplete: () => void;
  onRecapSubmitted: () => void;
  isCompletingExercise: boolean;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
  onRecapSubmitted,
  isCompletingExercise,
}) => {
  const [isRecapDialogOpen, setIsRecapDialogOpen] = useState(false);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  const handleVideoComplete = () => {
    setIsVideoCompleted(true);
  };

  const handleRecapSubmitted = () => {
    setIsRecapDialogOpen(false);
    onRecapSubmitted();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{exercise.title}</CardTitle>
            {exercise.is_required && (
              <Badge variant="destructive">Bắt buộc</Badge>
            )}
          </div>
          {exercise.description && (
            <p className="text-muted-foreground">{exercise.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {exercise.min_completion_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Thời gian tối thiểu: {exercise.min_completion_time} phút</span>
            </div>
          )}

          {exercise.content && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Nội dung bài học</h3>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{exercise.content}</p>
              </div>
            </div>
          )}

          {exercise.exercise_video_url && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Video bài học</h3>
              </div>
              <SecureVideoPlayer
                videoUrl={exercise.exercise_video_url}
                onComplete={handleVideoComplete}
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Hoàn thành bài học</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setIsRecapDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Nộp tóm tắt bài học
              </Button>

              <Button
                onClick={onComplete}
                disabled={isCompletingExercise}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompletingExercise ? "Đang xử lý..." : "Hoàn thành bài học"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecapSubmissionDialog
        isOpen={isRecapDialogOpen}
        onClose={() => setIsRecapDialogOpen(false)}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        onRecapSubmitted={handleRecapSubmitted}
      />
    </div>
  );
};

export default ExerciseContent;
