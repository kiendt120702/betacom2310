import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useUserQuizSubmissions } from "@/hooks/useQuizSubmissions";
import { useUserPracticeTestSubmissions } from "@/hooks/usePracticeTestSubmissions";
import { useUserEssaySubmissions } from "@/hooks/useEssaySubmissions";
import { Video, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContentProtection } from "@/hooks/useContentProtection";
import { formatProgressTime } from "@/utils/videoTimeUtils";

/**
 * Learning Progress Page Component
 * Displays student learning progress including time spent, scores, and viewing requirements
 */
const LearningProgressPage = () => {
  useContentProtection();

  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: submissions, isLoading: submissionsLoading } = useVideoReviewSubmissions();
  const { data: progressData, isLoading: progressLoading } = useUserExerciseProgress();
  const { data: quizSubmissions, isLoading: quizSubmissionsLoading } = useUserQuizSubmissions();
  const { data: practiceTestSubmissions, isLoading: practiceTestSubmissionsLoading } = useUserPracticeTestSubmissions();
  const { data: essaySubmissions, isLoading: essaySubmissionsLoading } = useUserEssaySubmissions();

  const getSubmissionStats = (exerciseId: string) => {
    const exerciseSubmissions = submissions?.filter(s => s.exercise_id === exerciseId) || [];
    const submittedCount = exerciseSubmissions.length;
    const exercise = exercises?.find(e => e.id === exerciseId);
    const required = exercise?.min_review_videos || 0;
    const isComplete = submittedCount >= required;
    const progress = Array.isArray(progressData) ? progressData.find(p => p.exercise_id === exerciseId) : null;
    const timeSpent = progress?.time_spent || 0;
    const videoDuration = progress?.video_duration || 0;
    const requiredViewingCount = exercise?.required_viewing_count || 1;
    
    const quizSubmission = quizSubmissions?.find(qs => qs.edu_quizzes?.exercise_id === exerciseId);
    const essaySubmission = essaySubmissions?.find(es => es.exercise_id === exerciseId);

    let theoryScore: number | null | undefined = null;
    let theoryPassed: boolean | null = null;
    let theoryType: 'mcq' | 'essay' | null = null;

    if (quizSubmission) {
      theoryScore = quizSubmission.score;
      theoryPassed = quizSubmission.passed;
      theoryType = 'mcq';
    } else if (essaySubmission && essaySubmission.status === 'graded') {
      theoryScore = essaySubmission.score;
      const progressForEssay = Array.isArray(progressData) ? progressData.find(p => p.exercise_id === exerciseId) : null;
      theoryPassed = !!progressForEssay?.quiz_passed;
      theoryType = 'essay';
    }

    const practiceTestSubmission = practiceTestSubmissions?.find(pts => pts.practice_tests?.exercise_id === exerciseId);
    const practiceScore = practiceTestSubmission?.score || 0;
    const practiceStatus = practiceTestSubmission?.status;

    return {
      submitted: submittedCount,
      required,
      isComplete,
      timeSpent,
      videoDuration,
      requiredViewingCount,
      quizScore: theoryScore,
      quizPassed: theoryPassed,
      quizType: theoryType,
      practiceScore,
      practiceStatus,
    };
  };

  const isLoading = exercisesLoading || submissionsLoading || progressLoading || quizSubmissionsLoading || practiceTestSubmissionsLoading || essaySubmissionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
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
      <Card>
        <CardContent className="pt-6">
          {exercises && exercises.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead className="text-center">Số lần xem YC</TableHead>
                  <TableHead className="text-center">Tổng thời gian học</TableHead>
                  <TableHead className="text-center">Điểm lý thuyết</TableHead>
                  <TableHead className="text-center">Điểm thực hành</TableHead>
                  <TableHead className="text-center">Video quay ôn tập</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => {
                  const stats = getSubmissionStats(exercise.id);
                  const totalRequiredTime = (stats.videoDuration || 0) * stats.requiredViewingCount;
                  
                  return (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">{exercise.title}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Eye className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold">
                            {stats.requiredViewingCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {totalRequiredTime > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className={cn(
                              "font-semibold",
                              stats.timeSpent >= totalRequiredTime ? "text-green-600" : "text-orange-600"
                            )}>
                              {formatProgressTime(stats.timeSpent, totalRequiredTime)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stats.quizScore !== undefined && stats.quizScore !== null ? (
                          <Badge
                            className={cn(
                              "font-semibold",
                              stats.quizPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                          >
                            {stats.quizScore}{stats.quizType === 'mcq' ? '%' : 'đ'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stats.practiceStatus === 'graded' && stats.practiceScore > 0 ? (
                          <Badge
                            className={cn(
                              "font-semibold",
                              stats.practiceScore >= 60 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                          >
                            {stats.practiceScore}
                          </Badge>
                        ) : stats.practiceStatus === 'pending' ? (
                          <Badge variant="outline">Chờ chấm</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Video className="h-4 w-4 text-blue-500" />
                          <span className={cn(
                            "font-semibold",
                            stats.isComplete ? "text-green-600" : "text-red-600"
                          )}>
                            {stats.submitted}/{stats.required}
                          </span>
                        </div>
                      </TableCell>
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
    </div>
  );
};

export default LearningProgressPage;