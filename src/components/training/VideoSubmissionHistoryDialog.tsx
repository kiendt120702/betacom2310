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
import { Video, ExternalLink } from "lucide-react"; // Changed PlayCircle to ExternalLink
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

  return (
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
                  <TableHead>Link Video</TableHead> {/* Changed column header */}
                  <TableHead>Ngày nộp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={submission.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="max-w-[250px] truncate"> {/* Added max-width and truncate */}
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
  );
};

export default VideoSubmissionHistoryDialog;