import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { FileUp, Video, CheckCircle, XCircle, History, Clock } from "lucide-react";
import VideoSubmissionDialog from "@/components/video/VideoSubmissionDialog";
import VideoSubmissionHistoryDialog from "@/components/training/VideoSubmissionHistoryDialog";
import { cn } from "@/lib/utils";
import { TrainingExercise } from "@/types/training";
import { useContentProtection } from "@/hooks/useContentProtection";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { formatLearningTime } from "@/utils/learningUtils";

const LearningProgressPage = () => {
  useContentProtection();
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: submissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = useVideoReviewSubmissions();
  const { data: progressData, isLoading: progressLoading } = useUserExerciseProgress();

  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = React.useState<TrainingExercise | null>(null);

  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = React.useState(false);
  const [selectedExerciseForSubmission, setSelectedExerciseForSubmission] = React.useState<TrainingExercise | null>(null);

  const sortedExercises = useMemo(() => {
    if (!exercises) return [];
    return [...exercises].sort((a, b) => a.order_index - b.order_index);
  }, [exercises]);

  const progressMap = useMemo(() => {
    if (!Array.isArray(progressData)) return new Map();
    return new Map(progressData.map(p => [p.exercise_id, p]));
  }, [progressData]);

  const getSubmissionStats = (exerciseId: string) => {
    const exerciseSubmissions = submissions?.filter(s => s.exercise_id === exerciseId) || [];
    const submittedCount = exerciseSubmissions.length;
    const exercise = exercises?.find(e => e.id === exerciseId);
    const required = exercise?.min_review_videos || 0;
    const remaining = Math.max(0, required - submittedCount);
    
    return {
      submitted: submittedCount,
      required,
      remaining,
      isComplete: remaining === 0
    };
  };

  const getStatusIcon = (stats: ReturnType<typeof getSubmissionStats>) => {
    if (stats.isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (stats: ReturnType<typeof getSubmissionStats>) => {
    if (stats.isComplete) return "Hoàn thành";
    return "Chưa đủ";
  };

  const getStatusColor = (stats: ReturnType<typeof getSubmissionStats>) => {
    if (stats.isComplete) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const handleOpenHistory = (exercise: TrainingExercise) => {
    setSelectedExerciseForHistory(exercise);
    setHistoryDialogOpen(true);
  };

  const handleOpenSubmissionDialog = (exercise: TrainingExercise) => {
    setSelectedExerciseForSubmission(exercise);
    setIsSubmissionDialogOpen(true);
  };

  const handleSubmissionSuccess = () => {
    refetchSubmissions(); // Refetch submissions after a successful new submission or edit
  };

  if (exercisesLoading || submissionsLoading || progressLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tiến độ học tập</h1>
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
          {sortedExercises && sortedExercises.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead className="text-center">Thời lượng tối thiểu</TableHead>
                  <TableHead className="text-center">Video đã quay</TableHead>
                  <TableHead className="text-center">Số video yêu cầu</TableHead>
                  <TableHead className="text-center">Video còn lại</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                  <TableHead className="text-center">Lịch sử nộp bài</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExercises.map((exercise) => {
                  const stats = getSubmissionStats(exercise.id);
                  const requiresSubmission = exercise.min_review_videos && exercise.min_review_videos > 0;
                  
                  return (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">{exercise.title}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{formatLearningTime(exercise.min_completion_time || 0)}</span>
                        </div>
                      </TableCell>
                      
                      {requiresSubmission ? (
                        <>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold">{stats.submitted}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-gray-600">{stats.required}</span>
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
                            <Button 
                              size="sm" 
                              variant={stats.isComplete ? "outline" : "destructive"}
                              onClick={() => handleOpenSubmissionDialog(exercise)}
                            >
                              <FileUp className="h-4 w-4 mr-2" />
                              Nộp video
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenHistory(exercise)}
                              disabled={stats.submitted === 0}
                            >
                              <History className="h-4 w-4 mr-2" />
                              Lịch sử
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={6} className="text-center text-muted-foreground italic">
                          Không yêu cầu nộp video
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4" />
              <p>Không có bài tập nào.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedExerciseForHistory && (
        <VideoSubmissionHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          exerciseId={selectedExerciseForHistory.id}
          exerciseTitle={selectedExerciseForHistory.title}
        />
      )}

      {selectedExerciseForSubmission && (
        <VideoSubmissionDialog
          open={isSubmissionDialogOpen}
          onOpenChange={setIsSubmissionDialogOpen}
          exerciseId={selectedExerciseForSubmission.id}
          exerciseTitle={selectedExerciseForSubmission.title}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default LearningProgressPage;