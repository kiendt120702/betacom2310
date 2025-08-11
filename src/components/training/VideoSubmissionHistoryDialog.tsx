import React from "react";
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
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { Video, Calendar, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import SecureVideoPlayer from "@/components/SecureVideoPlayer"; // To play videos
import { useState } from "react"; // For managing video preview dialog

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
  const { data: submissions, isLoading } = useVideoReviewSubmissions(exerciseId);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewVideoTitle, setPreviewVideoTitle] = useState<string | null>(null);

  const handleOpenVideoPreview = (url: string, title: string) => {
    setPreviewVideoUrl(url);
    setPreviewVideoTitle(title);
  };

  const handleCloseVideoPreview = () => {
    setPreviewVideoUrl(null);
    setPreviewVideoTitle(null);
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
                    <TableHead>Video</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission, index) => (
                    <TableRow key={submission.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => handleOpenVideoPreview(submission.video_url, `Video ôn tập #${index + 1}`)}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Xem video
                        </Button>
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: vi })}
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

      {/* Video Preview Dialog */}
      <Dialog open={!!previewVideoUrl} onOpenChange={handleCloseVideoPreview}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg">{previewVideoTitle}</DialogTitle>
          </DialogHeader>
          {previewVideoUrl && (
            <div className="p-4">
              <SecureVideoPlayer videoUrl={previewVideoUrl} title={previewVideoTitle || ""} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoSubmissionHistoryDialog;