import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useUserLearningDetails } from "@/hooks/useUserLearningDetails";
import { formatLearningTime } from "@/hooks/useLearningAnalytics";

interface UserLearningDetailsDialogProps {
  userId: string | null;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserLearningDetailsDialog: React.FC<UserLearningDetailsDialogProps> = ({
  userId,
  userName,
  open,
  onOpenChange,
}) => {
  const { data: details, isLoading } = useUserLearningDetails(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết tiến độ học tập: {userName}</DialogTitle>
          <DialogDescription>
            Xem chi tiết từng bài tập của người dùng.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-8">Đang tải chi tiết...</div>
        ) : (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bài tập</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Thời gian học</TableHead>
                  <TableHead className="text-center">Video bài học</TableHead>
                  <TableHead className="text-center">Recap</TableHead>
                  <TableHead className="text-center">Video ôn tập</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-center">
                      {item.progress?.is_completed ? (
                        <Badge variant="default" className="bg-green-600">Hoàn thành</Badge>
                      ) : (
                        <Badge variant="secondary">Chưa hoàn thành</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatLearningTime(item.progress?.time_spent || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.progress?.video_completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.progress?.recap_submitted ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.progress?.submitted_review_videos || 0} / {item.min_review_videos}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserLearningDetailsDialog;