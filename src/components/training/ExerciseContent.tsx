
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Play, Video } from "lucide-react";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import RecapSubmissionDialog from "./RecapSubmissionDialog";
import { EduExercise } from "@/hooks/useEduExercises";
import { cn } from "@/lib/utils";

interface ExerciseContentProps {
  exercise: EduExercise;
  onComplete: () => void;
  isCompletingExercise: boolean;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
  isCompletingExercise,
}) => {
  const [showRecapDialog, setShowRecapDialog] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [recapSubmitted, setRecapSubmitted] = useState(false);

  const canCompleteExercise = videoCompleted && recapSubmitted;

  const handleRecapSubmitted = () => {
    setRecapSubmitted(true);
    setShowRecapDialog(false);
  };

  const handleVideoComplete = () => {
    setVideoCompleted(true);
  };

  useEffect(() => {
    if (canCompleteExercise) {
      onComplete();
    }
  }, [canCompleteExercise, onComplete]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{exercise.title}</h1>
          {exercise.description && (
            <p className="text-muted-foreground mt-2">{exercise.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={exercise.is_required ? "destructive" : "secondary"}>
            {exercise.is_required ? "Bắt buộc" : "Tự chọn"}
          </Badge>
          {exercise.min_completion_time && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exercise.min_completion_time} phút
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Exercise Content */}
      {exercise.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Nội dung bài tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Exercise Video */}
      {exercise.exercise_video_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video hướng dẫn
            </CardTitle>
            <CardDescription>
              Xem video để hiểu rõ hơn về bài tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <SecureVideoPlayer
                src={exercise.exercise_video_url}
                onComplete={handleVideoComplete}
                className="w-full h-full"
              />
            </div>
            {videoCompleted && (
              <div className="flex items-center gap-2 mt-3 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Video đã hoàn thành</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="space-y-1">
          <p className="font-medium">Hoàn thành bài tập</p>
          <p className="text-sm text-muted-foreground">
            {!videoCompleted && !recapSubmitted && "Xem video và nộp tóm tắt để hoàn thành"}
            {videoCompleted && !recapSubmitted && "Nộp tóm tắt để hoàn thành"}
            {!videoCompleted && recapSubmitted && "Xem video để hoàn thành"}
            {videoCompleted && recapSubmitted && "Bài tập đã hoàn thành!"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowRecapDialog(true)}
            disabled={recapSubmitted}
            className={cn(
              recapSubmitted && "bg-green-50 border-green-200 text-green-700"
            )}
          >
            {recapSubmitted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Đã nộp tóm tắt
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Nộp tóm tắt
              </>
            )}
          </Button>

          {canCompleteExercise && (
            <Button
              onClick={onComplete}
              disabled={isCompletingExercise}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompletingExercise ? (
                "Đang xử lý..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Hoàn thành
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <RecapSubmissionDialog
        open={showRecapDialog}
        onOpenChange={setShowRecapDialog}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        onRecapSubmitted={handleRecapSubmitted}
      />
    </div>
  );
};

export default ExerciseContent;
