
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useExerciseReviewSubmissions,
  useDeleteReviewSubmission,
} from "@/hooks/useExerciseReviewSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { ExternalLink, Trash2, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ReviewSubmissionsListProps {
  exerciseId: string;
  exerciseTitle: string;
  requiredCount: number;
}

const ReviewSubmissionsList = ({ 
  exerciseId, 
  exerciseTitle, 
  requiredCount 
}: ReviewSubmissionsListProps) => {
  const { user } = useAuth();
  const { data: submissions, isLoading } = useExerciseReviewSubmissions(exerciseId);
  const { mutate: deleteSubmission } = useDeleteReviewSubmission();

  const userSubmissions = submissions?.filter(s => s.user_id === user?.id) || [];
  const completedCount = userSubmissions.length;
  const isCompleted = completedCount >= requiredCount;

  if (isLoading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header với tiến độ */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Video ôn tập đã nộp</h3>
        <div className="flex items-center gap-2">
          <Badge variant={isCompleted ? "default" : "secondary"}>
            {completedCount}/{requiredCount} video
          </Badge>
          {isCompleted && (
            <Badge variant="default" className="bg-green-500">
              ✓ Hoàn thành
            </Badge>
          )}
        </div>
      </div>

      {/* Danh sách video đã nộp */}
      {userSubmissions.length > 0 ? (
        <div className="grid gap-3">
          {userSubmissions.map((submission, index) => (
            <Card key={submission.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">
                    Video ôn tập #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubmission(submission.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {submission.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Nộp ngày {format(new Date(submission.submitted_at), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <a 
                      href={submission.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Xem video
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Chưa có video ôn tập nào được nộp</p>
          <p className="text-sm">Cần nộp {requiredCount} video để hoàn thành bài tập</p>
        </div>
      )}

      {/* Thông báo tiến độ */}
      {!isCompleted && userSubmissions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-700">
              Còn thiếu {requiredCount - completedCount} video nữa để hoàn thành bài tập này
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmissionsList;
