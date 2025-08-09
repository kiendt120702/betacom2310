
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useExerciseReviewSubmissions } from "@/hooks/useExerciseReviewSubmissions";
import { useAuth } from "@/hooks/useAuth";
import ReviewSubmissionForm from "@/components/training/ReviewSubmissionForm";
import ReviewSubmissionsList from "@/components/training/ReviewSubmissionsList";
import { BookOpen, Upload, CheckCircle2, FileText } from "lucide-react";

const AssignmentSubmissionPage = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const { user } = useAuth();
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: allSubmissions, isLoading: submissionsLoading } = useExerciseReviewSubmissions();

  // Sắp xếp bài tập theo order_index
  const orderedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  // Tính toán thống kê cho mỗi bài tập
  const getExerciseStats = (exerciseId: string, requiredCount: number) => {
    const userSubmissions = allSubmissions?.filter(
      sub => sub.exercise_id === exerciseId && sub.user_id === user?.id
    ) || [];
    
    const submitted = userSubmissions.length;
    const remaining = Math.max(0, requiredCount - submitted);
    const isCompleted = submitted >= requiredCount;
    const progress = requiredCount > 0 ? (submitted / requiredCount) * 100 : 0;

    return { submitted, remaining, isCompleted, progress };
  };

  const handleSubmitForExercise = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setShowSubmissionForm(true);
  };

  if (exercisesLoading || submissionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-4 bg-muted rounded w-96" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Nộp bài tập</h1>
        <p className="text-muted-foreground">
          Chọn bài tập và nộp phần ôn tập của bạn
        </p>
      </div>

      {/* Thống kê tổng quan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tổng quan tiến độ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orderedExercises.length}
              </div>
              <div className="text-sm text-muted-foreground">Tổng bài tập</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {orderedExercises.filter(ex => getExerciseStats(ex.id, ex.min_review_videos).isCompleted).length}
              </div>
              <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {orderedExercises.reduce((total, ex) => 
                  total + getExerciseStats(ex.id, ex.min_review_videos).remaining, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Video còn lại</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách bài tập */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Danh sách bài tập</h2>
          <Badge variant="outline" className="text-sm">
            {orderedExercises.length} bài tập
          </Badge>
        </div>

        {orderedExercises.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Chưa có bài tập nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orderedExercises.map((exercise, index) => {
              const stats = getExerciseStats(exercise.id, exercise.min_review_videos);
              
              return (
                <Card key={exercise.id} className={`transition-all hover:shadow-md ${
                  stats.isCompleted ? 'border-green-200 bg-green-50/30' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Bài {index + 1}
                          </Badge>
                          {stats.isCompleted && (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Hoàn thành
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {exercise.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Tiến độ */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ:</span>
                        <span className="font-medium">
                          {stats.submitted}/{exercise.min_review_videos} video
                        </span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                      {stats.remaining > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Còn lại {stats.remaining} video ôn tập
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSubmitForExercise(exercise.id)}
                        disabled={stats.isCompleted}
                        className="flex-1"
                        size="sm"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        {stats.isCompleted ? "Đã hoàn thành" : "Nộp bài"}
                      </Button>
                      
                      {stats.submitted > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedExerciseId(exercise.id)}
                        >
                          Xem ({stats.submitted})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Chi tiết bài tập được chọn */}
      {selectedExerciseId && !showSubmissionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewSubmissionsList
              exerciseId={selectedExerciseId}
              exerciseTitle={orderedExercises.find(ex => ex.id === selectedExerciseId)?.title || ""}
              requiredCount={orderedExercises.find(ex => ex.id === selectedExerciseId)?.min_review_videos || 0}
            />
          </CardContent>
        </Card>
      )}

      {/* Form nộp bài */}
      <ReviewSubmissionForm
        open={showSubmissionForm}
        onOpenChange={(open) => {
          setShowSubmissionForm(open);
          if (!open) {
            setSelectedExerciseId(null);
          }
        }}
        selectedExerciseId={selectedExerciseId}
      />
    </div>
  );
};

export default AssignmentSubmissionPage;
