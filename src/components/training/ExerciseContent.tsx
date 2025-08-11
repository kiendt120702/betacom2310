
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Play, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoSubmissionDialog from "@/components/video/VideoSubmissionDialog";
import RecapSubmissionDialog from "@/components/training/RecapSubmissionDialog";
import { useGetExerciseRecap, useSubmitRecap } from "@/hooks/useExerciseRecaps";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import DOMPurify from 'dompurify';

// Safe logging function
const secureLog = (message: string, data?: any) => {
  if (typeof window !== 'undefined' && window.console) {
    console.log(`[ExerciseContent] ${message}`, data);
  }
};

interface EduExercise {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
  order_index: number;
  course_id: string;
  created_at: string;
  updated_at: string;
  estimated_duration?: number;
  exercise_type: 'video' | 'reading' | 'assignment';
  requires_submission: boolean;
}

interface ExerciseContentProps {
  exercise: EduExercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({ 
  exercise, 
  onComplete 
}) => {
  const { toast } = useToast();
  const [recapContent, setRecapContent] = useState("");
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVideoSubmissionDialog, setShowVideoSubmissionDialog] = useState(false);
  const [showRecapDialog, setShowRecapDialog] = useState(false);

  // Hooks for data management
  const { 
    data: userProgress, 
    updateProgress,
    isLoading: progressLoading 
  } = useUserExerciseProgress(exercise.id);

  const { 
    data: existingRecap, 
    isLoading: recapLoading 
  } = useGetExerciseRecap(exercise.id);

  const submitRecap = useSubmitRecap();

  // Memoized values
  const hasSubmittedRecap = useMemo(() => 
    Boolean(existingRecap?.submitted_at), 
    [existingRecap?.submitted_at]
  );

  const isCompleted = useMemo(() => 
    userProgress?.is_completed || false, 
    [userProgress?.is_completed]
  );

  // Load existing recap content
  useEffect(() => {
    if (existingRecap?.recap_content && !recapContent) {
      setRecapContent(existingRecap.recap_content);
      secureLog("Loaded existing recap content");
    }
  }, [existingRecap?.recap_content, recapContent]);

  // Handle video completion
  const handleVideoComplete = useCallback(() => {
    setHasWatchedVideo(true);
    secureLog("Video marked as watched");
    
    // Update progress to reflect video completion
    updateProgress({
      exercise_id: exercise.id,
      video_completed: true,
    });
  }, [updateProgress, exercise.id]);

  const handleRecapSubmit = useCallback(async () => {
    if (!recapContent.trim()) {
      return;
    }

    try {
      secureLog("Submitting recap", { exerciseId: exercise.id });
      
      // Submit recap first
      await submitRecap.mutateAsync({
        exercise_id: exercise.id,
        recap_content: recapContent.trim(),
      });

      setHasUnsavedChanges(false);

      // Then update progress separately to mark recap as submitted
      await updateProgress({
        exercise_id: exercise.id,
        recap_submitted: true,
        is_completed: true,
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error) {
      secureLog("Recap submission error:", error);
      // Error handling is done in the hook
    }
  }, [exercise.id, recapContent, submitRecap, updateProgress, onComplete]);

  const handleRecapChange = useCallback((value: string) => {
    setRecapContent(value);
    setHasUnsavedChanges(value !== (existingRecap?.recap_content || ""));
  }, [existingRecap?.recap_content]);

  const sanitizedContent = useMemo(() => {
    if (!exercise.content) return '';
    
    return DOMPurify.sanitize(exercise.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button']
    });
  }, [exercise.content]);

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'reading': return 'Đọc hiểu';
      case 'assignment': return 'Bài tập';
      default: return type;
    }
  };

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'assignment': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (progressLoading || recapLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getExerciseTypeIcon(exercise.exercise_type)}
              <Badge variant="outline">
                {getExerciseTypeLabel(exercise.exercise_type)}
              </Badge>
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Hoàn thành
                </Badge>
              )}
            </div>
            {exercise.estimated_duration && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {exercise.estimated_duration} phút
              </div>
            )}
          </div>
          <CardTitle className="text-xl">{exercise.title}</CardTitle>
          <CardDescription>
            Trạng thái: {isCompleted ? "Hoàn thành" : "Đang học"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Section */}
          {exercise.video_url && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Video bài học</h3>
              <div className="aspect-video">
                <iframe
                  src={exercise.video_url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  onLoad={() => handleVideoComplete()}
                />
              </div>
              {exercise.requires_submission && (
                <Button 
                  onClick={() => setShowVideoSubmissionDialog(true)}
                  variant="outline"
                  className="w-full"
                >
                  Nộp video thực hành
                </Button>
              )}
            </div>
          )}

          {/* Content Section */}
          {sanitizedContent && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nội dung bài học</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>
          )}

          {/* Recap Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tóm tắt bài học</h3>
              {hasSubmittedRecap && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đã nộp
                </Badge>
              )}
            </div>
            
            <Textarea
              value={recapContent}
              onChange={(e) => handleRecapChange(e.target.value)}
              placeholder="Hãy viết tóm tắt những gì bạn đã học được từ bài học này..."
              className="min-h-[150px]"
              disabled={hasSubmittedRecap}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {hasUnsavedChanges && "Có thay đổi chưa lưu"}
              </div>
              <Button
                onClick={handleRecapSubmit}
                disabled={
                  !hasWatchedVideo ||
                  !recapContent.trim() ||
                  submitRecap.isPending ||
                  (!hasUnsavedChanges && hasSubmittedRecap)
                }
                className="min-w-[100px]"
              >
                {submitRecap.isPending ? (
                  "Đang gửi..."
                ) : hasSubmittedRecap && !hasUnsavedChanges ? (
                  "Đã gửi"
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi tóm tắt
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showVideoSubmissionDialog && (
        <VideoSubmissionDialog
          exerciseId={exercise.id}
          exerciseTitle={exercise.title}
          open={showVideoSubmissionDialog}
          onOpenChange={setShowVideoSubmissionDialog}
        >
          <div />
        </VideoSubmissionDialog>
      )}

      {showRecapDialog && (
        <RecapSubmissionDialog
          exerciseId={exercise.id}
          exerciseTitle={exercise.title}
          onRecapSubmitted={() => setShowRecapDialog(false)}
        >
          <div />
        </RecapSubmissionDialog>
      )}
    </div>
  );
};

export default ExerciseContent;
