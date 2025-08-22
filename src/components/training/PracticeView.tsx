import React, { useState } from 'react';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, History, FileUp } from 'lucide-react';
import VideoSubmissionDialog from '@/components/video/VideoSubmissionDialog';
import VideoSubmissionHistoryDialog from '@/components/training/VideoSubmissionHistoryDialog';
import { useVideoReviewSubmissions } from '@/hooks/useVideoReviewSubmissions';

interface PracticeViewProps {
  exercise: TrainingExercise;
}

const PracticeView: React.FC<PracticeViewProps> = ({ exercise }) => {
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const { data: submissions, refetch } = useVideoReviewSubmissions(exercise.id);

  const submissionCount = submissions?.length || 0;
  const requiredCount = exercise.min_review_videos || 0;
  const isComplete = submissionCount >= requiredCount;

  const handleSubmissionSuccess = () => {
    refetch();
  };

  if (requiredCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kiểm tra thực hành</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bài tập này không yêu cầu nộp bài thực hành.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kiểm tra thực hành</CardTitle>
          <CardDescription>
            Nộp video thực hành theo yêu cầu của bài tập.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p><strong>Yêu cầu:</strong> Nộp đủ <span className="font-bold text-primary">{requiredCount}</span> video ôn tập.</p>
            <p><strong>Tiến độ:</strong> Đã nộp <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>{submissionCount} / {requiredCount}</span> video.</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setIsSubmissionDialogOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Nộp video mới
            </Button>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)} disabled={submissionCount === 0}>
              <History className="h-4 w-4 mr-2" />
              Xem lịch sử nộp
            </Button>
          </div>
        </CardContent>
      </Card>

      <VideoSubmissionDialog
        open={isSubmissionDialogOpen}
        onOpenChange={setIsSubmissionDialogOpen}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        onSubmissionSuccess={handleSubmissionSuccess}
      />

      <VideoSubmissionHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
      />
    </>
  );
};

export default PracticeView;