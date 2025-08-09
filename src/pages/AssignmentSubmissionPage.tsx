
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { FileUp, Video, CheckCircle, Clock, XCircle } from "lucide-react";
import VideoSubmissionDialog from "@/components/video/VideoSubmissionDialog";
import { cn } from "@/lib/utils";

const AssignmentSubmissionPage = () => {
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: submissions, isLoading: submissionsLoading } = useVideoReviewSubmissions();

  const getSubmissionStats = (exerciseId: string) => {
    const exerciseSubmissions = submissions?.filter(s => s.exercise_id === exerciseId) || [];
    const approvedCount = exerciseSubmissions.filter(s => s.status === 'approved').length;
    const exercise = exercises?.find(e => e.id === exerciseId);
    const required = exercise?.required_review_videos || 0;
    const remaining = Math.max(0, required - approvedCount);
    
    return {
      submitted: approvedCount,
      required,
      remaining,
      isComplete: remaining === 0,
      pendingCount: exerciseSubmissions.filter(s => s.status === 'pending').length
    };
  };

  const getStatusIcon = (stats: ReturnType<typeof getSubmissionStats>) => {
    if (stats.isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (stats.pendingCount > 0) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (stats: ReturnType<typeof getSubmissionStats>) => {
    if (stats.isComplete) return "Hoàn thành";
    if (stats.pendingCount > 0) return "Đang chờ duyệt";
    return "Chưa đủ";
  };

  const getStatusColor = (stats: ReturnType<typeof getSubmissionStats>) => {
    if (stats.isComplete) return "bg-green-100 text-green-800";
    if (stats.pendingCount > 0) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (exercisesLoading || submissionsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nộp video ôn tập</h1>
        <p className="text-muted-foreground">
          Theo dõi tiến độ và nộp video ôn tập cho từng bài tập
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài tập và tiến độ video ôn tập</CardTitle>
          <CardDescription>
            Bạn cần hoàn thành đủ số video ôn tập yêu cầu cho mỗi bài tập để pass
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exercises && exercises.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead className="text-center">Video đã quay</TableHead>
                  <TableHead className="text-center">Video còn lại</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => {
                  const stats = getSubmissionStats(exercise.id);
                  
                  return (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{exercise.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Yêu cầu: {stats.required} video
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Video className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{stats.submitted}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-semibold",
                          stats.remaining === 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {stats.remaining}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "flex items-center gap-1 justify-center w-fit mx-auto",
                          getStatusColor(stats)
                        )}>
                          {getStatusIcon(stats)}
                          {getStatusText(stats)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <VideoSubmissionDialog
                          exerciseId={exercise.id}
                          exerciseTitle={exercise.title}
                        >
                          <Button 
                            size="sm" 
                            variant={stats.isComplete ? "outline" : "default"}
                          >
                            <FileUp className="h-4 w-4 mr-2" />
                            Nộp video
                          </Button>
                        </VideoSubmissionDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4" />
              <p>Chưa có bài tập nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentSubmissionPage;
