import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Video, 
  CheckCircle, 
  BookOpen,
  Trophy,
  Target,
  Play,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { usePersonalExerciseDetails } from "@/hooks/usePersonalExerciseDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLearningTime } from "@/utils/learningUtils";

const PersonalExerciseDetails: React.FC = () => {
  const { data: exercises, isLoading, error } = usePersonalExerciseDetails();

  if (isLoading) {
    return <PersonalExerciseDetailsSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Có lỗi xảy ra khi tải dữ liệu: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Chưa có bài học nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Chi tiết tiến độ từng bài học</h2>
        <p className="text-muted-foreground">Theo dõi chi tiết tiến độ học tập của từng bài</p>
      </div>

      <div className="grid gap-4">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.exercise_id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
};

interface ExerciseCardProps {
  exercise: PersonalExerciseDetail;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusBadge = (completed: boolean, inProgress: boolean) => {
    if (completed) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Hoàn thành</Badge>;
    }
    if (inProgress) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Đang học</Badge>;
    }
    return <Badge variant="outline" className="text-gray-600">Chưa bắt đầu</Badge>;
  };

  const completedTasks = [
    exercise.video_completed,
    exercise.theory_read,
    exercise.quiz_passed,
    exercise.practice_completed,
    exercise.practice_test_completed
  ].filter(Boolean).length;

  const totalTasks = 5;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {exercise.exercise_order}
              </span>
              {exercise.exercise_title}
            </CardTitle>
            <CardDescription className="mt-1">
              Cập nhật lần cuối: {exercise.last_updated 
                ? new Date(exercise.last_updated).toLocaleDateString('vi-VN')
                : 'Chưa bắt đầu'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(exercise.is_completed, progressPercentage > 0 && !exercise.is_completed)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Tiến độ hoàn thành</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Completion Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Video className={`h-4 w-4 ${exercise.video_completed ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${exercise.video_completed ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
              Xem video
            </span>
            {exercise.video_completed && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className={`h-4 w-4 ${exercise.theory_read ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${exercise.theory_read ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
              Đọc lý thuyết
            </span>
            {exercise.theory_read && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>

          <div className="flex items-center gap-2">
            <Trophy className={`h-4 w-4 ${exercise.quiz_passed ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`text-sm ${exercise.quiz_passed ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
              Làm quiz
            </span>
            {exercise.quiz_passed && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
          {/* Time Spent */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">
                {formatLearningTime(exercise.time_spent_minutes)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Thời gian học</p>
          </div>

          {/* Quiz Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-600">
                {exercise.quiz_score || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Điểm quiz</p>
          </div>

          {/* Review Videos */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <RotateCcw className="h-4 w-4 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {exercise.review_videos_count}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Video ôn tập</p>
          </div>

          {/* Required Reviews */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">
                {exercise.required_reviews || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Yêu cầu ôn tập</p>
          </div>
        </div>

        {/* Additional Details */}
        {(exercise.review_videos_count < (exercise.required_reviews || 0)) && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              Cần thêm {(exercise.required_reviews || 0) - exercise.review_videos_count} video ôn tập để hoàn thành bài học
            </span>
          </div>
        )}

        {/* Watch Time Details */}
        {exercise.video_watch_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Play className="h-4 w-4" />
            <span>
              Tổng thời gian xem video: {formatLearningTime(exercise.video_watch_time)} 
              {exercise.video_watch_percentage && ` (${exercise.video_watch_percentage.toFixed(1)}%)`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PersonalExerciseDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-48 mb-3" />
              <Skeleton className="h-2 w-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="text-center">
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export interface PersonalExerciseDetail {
  exercise_id: string;
  exercise_title: string;
  exercise_order: number;
  video_completed: boolean;
  theory_read: boolean;
  quiz_passed: boolean;
  practice_completed: boolean;
  practice_test_completed: boolean;
  is_completed: boolean;
  time_spent_minutes: number;
  completion_percentage: number;
  last_updated: string | null;
  quiz_score?: number;
  review_videos_count: number;
  required_reviews?: number;
  video_watch_time?: number;
  video_watch_percentage?: number;
}

export default PersonalExerciseDetails;