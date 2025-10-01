import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { TrainingExercise } from "@/types/training";
import { EssaySubmissionWithDetails } from "@/hooks/useEssaySubmissions";
import { safeFormatDate } from "@/utils/dateUtils";

interface EssaySubmissionListDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: TrainingExercise | null;
  submissions: EssaySubmissionWithDetails[];
  onGradeSubmission: (submission: EssaySubmissionWithDetails) => void;
}

const EssaySubmissionListDialog: React.FC<EssaySubmissionListDialogProps> = ({
  open,
  onClose,
  exercise,
  submissions,
  onGradeSubmission,
}) => {
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Danh sách bài nộp: {exercise.title}</DialogTitle>
          <DialogDescription>
            Xem và chấm điểm các bài làm của học viên cho bài tập này.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên người làm</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.profiles?.full_name || submission.profiles?.email}</TableCell>
                      <TableCell>{safeFormatDate(submission.submitted_at, "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={submission.status === 'pending' ? 'destructive' : 'default'}>
                          {submission.status === 'pending' ? 'Chờ chấm' : 'Đã chấm'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {submission.score ?? '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => onGradeSubmission(submission)}>
                          <Edit className="w-4 h-4 mr-2" />
                          {submission.status === 'pending' ? 'Chấm bài' : 'Xem/Sửa'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Chưa có học viên nào nộp bài.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EssaySubmissionListDialog;