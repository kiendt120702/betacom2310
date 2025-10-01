import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useVideoReviewSubmissions, VideoReviewSubmission } from "@/hooks/useVideoReviewSubmissions";
import { Video, ExternalLink, Edit } from "lucide-react"; // Import Edit icon
import { safeFormatDate } from "@/utils/dateUtils";
import VideoSubmissionDialog from "@/components/video/VideoSubmissionDialog"; // Import VideoSubmissionDialog

interface VideoSubmissionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseId: string;
  exerciseTitle: string;
}

const VideoSubmissionHistoryDialog: React.FC<VideoSubmissionHistoryDialogProps> = ({
  open,
  onOpenChange,
  exerciseId,
  exerciseTitle,
}) => {
  const { data: submissions, isLoading, refetch } = useVideoReviewSubmissions(exerciseId);
  const [editingSubmission, setEditingSubmission] = useState<VideoReviewSubmission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (submission: VideoReviewSubmission) => {
    setEditingSubmission(submission);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (dialogOpen: boolean) => {
    setIsEditDialogOpen(dialogOpen);
    if (!dialogOpen) {
      setEditingSubmission(null);
      refetch(); // Refetch submissions after edit
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Lịch sử nộp video ôn tập - {exerciseTitle}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Đang tải lịch sử...</p>
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">STT</TableHead>
                    <TableHead>Link Video</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead> {/* Added Thao tác column */}
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
                        {safeFormatDate(submission.submitted_at, "dd/MM/yyyy HH:mm")}
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
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có video nào được nộp cho bài tập này.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Video Submission Dialog */}
      {editingSubmission && (
        <VideoSubmissionDialog
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
          exerciseId={editingSubmission.exercise_id}
          exerciseTitle={exerciseTitle} // Pass original exercise title
          initialSubmission={editingSubmission}
          onSubmissionSuccess={refetch} // Refetch when edit is successful
        >
          {/* No children needed here as it's triggered by state */}
        </VideoSubmissionDialog>
      )}
    </>
  );
};

export default VideoSubmissionHistoryDialog;