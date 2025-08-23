import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeneralTraining } from "@/hooks/useGeneralTraining";
import { BookOpen, ChevronRight, PlayCircle, Users } from "lucide-react";
import { GeneralTrainingExercise } from "@/hooks/useGeneralTraining";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContentProtection } from "@/hooks/useContentProtection";

const GeneralTrainingLearningPage = () => {
  useContentProtection();
  const { data: exercises, isLoading, error } = useGeneralTraining();
  const navigate = useNavigate();

  const orderedExercises =
    exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Có lỗi xảy ra khi tải dữ liệu... Vui lòng thử lại sau.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          Đào tạo Chung
        </h1>
        <p className="text-muted-foreground mt-2">
          Các khóa học và video đào tạo dành cho toàn bộ nhân viên
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lộ trình học tập
          </CardTitle>
          <CardDescription>
            Hoàn thành các bài học theo thứ tự để đạt được hiệu quả tốt nhất
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderedExercises.length > 0 ? (
            orderedExercises.map((exercise, index) => (
              <GeneralTrainingStep
                key={exercise.id}
                exercise={exercise}
                stepNumber={index + 1}
                isLast={index === orderedExercises.length - 1}
                onStartLearning={() => navigate(`/general-training-content?exercise=${exercise.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Chưa có khóa học nào được thiết lập</p>
              <p className="text-sm mt-2">Vui lòng liên hệ quản trị viên để thêm nội dung đào tạo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Component cho mỗi bước đào tạo chung
interface GeneralTrainingStepProps {
  exercise: GeneralTrainingExercise;
  stepNumber: number;
  isLast: boolean;
  onStartLearning: () => void;
}

const GeneralTrainingStep: React.FC<GeneralTrainingStepProps> = ({
  exercise,
  stepNumber,
  isLast,
  onStartLearning,
}) => {
  const hasVideo = Boolean(exercise.video_url);
  const hasContent = Boolean(exercise.content);

  return (
    <div className="relative">
      <div className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
        {/* Step Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
          {stepNumber}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{exercise.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  Chung
                </Badge>
              </div>
              
              {exercise.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {exercise.description}
                </p>
              )}

              {/* Content indicators */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                {hasVideo && (
                  <div className="flex items-center gap-1">
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                    <span>Video học tập</span>
                  </div>
                )}
                {hasContent && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span>Nội dung lý thuyết</span>
                  </div>
                )}
                {!hasVideo && !hasContent && (
                  <span className="text-orange-500">Đang cập nhật nội dung...</span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onStartLearning}
                className="flex items-center gap-2"
                disabled={!hasVideo && !hasContent}
                variant={hasVideo || hasContent ? "default" : "outline"}
              >
                {hasVideo ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                {hasVideo || hasContent ? "Bắt đầu học" : "Chờ cập nhật"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-8 top-16 w-px h-4 bg-border transform -translate-x-1/2"></div>
      )}
    </div>
  );
};

export default GeneralTrainingLearningPage;