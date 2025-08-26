import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useUserQuizSubmissions } from "@/hooks/useQuizSubmissions";
import { useUserEssaySubmissions } from "@/hooks/useEssaySubmissions";
import { Video, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContentProtection } from "@/hooks/useContentProtection";
import { formatLearningTime } from "@/utils/learningUtils";

const LearningProgressPage = () => {
  useContentProtection();
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: submissions, isLoading: submissionsLoading } = useVideoReviewSubmissions();
  const { data: progressData, isLoading: progressLoading } = useUserExerciseProgress();
  const { data: quizSubmissions, isLoading: quizSubmissionsLoading } = useUserQuizSubmissions();
  const { data: essaySubmissions, isLoading: essaySubmissionsLoading } = useUserEssaySubmissions();

  const getSubmissionStats = (exerciseId: string) => {
    const exerciseSubmissions = submissions?.filter(s => s.exercise_id === exerciseId) || [];
    const submittedCount = exerciseSubmissions.length;
    const exercise = exercises?.find(e => e.id === exerciseId);
    const required = exercise?.min_review_videos || 0;
    const isComplete = submittedCount >= required;
    const progress = Array.isArray(progressData) ? progressData.find(p => p.exercise_id === exerciseId) : null;
    const timeSpent = progress?.time_spent || 0;
    
    const quizSubmission = quizSubmissions?.find(qs => qs.edu_quizzes?.exercise_id === exerciseId);
    const quizScore = quizSubmission?.score;
    const quizPassed = quizSubmission?.passed;

    const essaySubmission = essaySubmissions?.find(s => s.exercise_id === exerciseId);
    const practiceScore = essaySubmission?.score;
    const practiceStatus = essaySubmission?.status;

    return {
      submitted: submittedCount,
      required,
      isComplete,
      timeSpent,
      quizScore,
      quizPassed,
      practiceScore,
      practiceStatus,
    };
  };

  const isLoading = exercisesLoading || submissionsLoading || progressLoading || quizSubmissionsLoading || essaySubmissionsLoading;

  if (isLoading) {
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
      <Card>
        <CardContent className="pt-6">
          {exercises && exercises.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead className="text-center">Tổng thời gian học</TableHead>
                  <TableHead className="text-center">Điểm lý thuyết</TableHead>
                  <TableHead className="text-center">Điểm thực hành</TableHead>
                  <TableHead className="text-center">Video quay ôn tập</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => {
                  const stats = getSubmissionStats(exercise.id);
                  
                  return (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">{exercise.title}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{formatLearningTime(stats.timeSpent)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {stats.quizScore !== undefined && stats.quizScore !== null ? (
                          <Badge
                            className={cn(
                              "font-semibold",
                              stats.quizPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                          >
                            {stats.quizScore}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stats.practiceStatus === 'graded' && stats.practiceScore !== null ? (
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