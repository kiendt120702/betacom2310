import React, { useState } from 'react';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, FileUp, ExternalLink, Edit, BookText } from 'lucide-react';
import VideoSubmissionDialog from '@/components/video/VideoSubmissionDialog';
import { useVideoReviewSubmissions, VideoReviewSubmission } from '@/hooks/useVideoReviewSubmissions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface PracticeViewProps {
  exercise: TrainingExercise;
}

const PracticeView: React.FC<PracticeViewProps> = ({ exercise }) => {
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const { data: submissions, refetch } = useVideoReviewSubmissions(exercise.id);

  const [editingSubmission, setEditingSubmission] = useState<VideoReviewSubmission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const submissionCount = submissions?.length || 0;
  const requiredCount = exercise.min_review_videos || 0;
  const isComplete = submissionCount >= requiredCount;
  const hasDocuments = Array.isArray(exercise.documents) && exercise.documents.length > 0;

  const handleSubmissionSuccess = () => {
    refetch();
  };

  const handleEditClick = (submission: VideoReviewSubmission) => {
    setEditingSubmission(submission);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (dialogOpen: boolean) => {
    setIsEditDialogOpen(dialogOpen);
    if (!dialogOpen) {
      setEditingSubmission(null);
      refetch();
    }
  };

  if (requiredCount === 0 && !hasDocuments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thực hành</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bài tập này không có phần thực hành.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hasDocuments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookText className="h-5 w-5" />
              Tài liệu tham khảo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exercise.documents!.map((doc, index) => (
                <li key={index}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {requiredCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nộp video ôn tập</CardTitle>
            <CardDescription>
              Nộp video ôn tập theo yêu cầu của bài tập.
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
            </div>

            {submissions && submissions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Lịch sử nộp</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Link Video</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission, index) => (
                        <TableRow key={submission.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="max-w-[250px] truncate">
                            <a
                              href={submission.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                              title={submission.video_url}
                            >
                              <ExternalLink className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{submission.video_url}</span>
                            </a>
                          </TableCell>
                          <TableCell>
                            {format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(submission)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <VideoSubmissionDialog
        open={isSubmissionDialogOpen}
        onOpenChange={setIsSubmissionDialogOpen}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        onSubmissionSuccess={handleSubmissionSuccess}
      />

      {editingSubmission && (
        <VideoSubmissionDialog
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
          exerciseId={editingSubmission.exercise_id}
          exerciseTitle={exercise.title}
          initialSubmission={editingSubmission}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </>
  );
};

export default PracticeView;