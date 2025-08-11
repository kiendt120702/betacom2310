import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEduExercises } from "@/hooks/useEduExercises";
import { BookOpen, ChevronRight } from "lucide-react";

const TrainingProcessPage = () => {
  const { data: exercises, isLoading, error } = useEduExercises();

  const orderedExercises =
    exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Có lỗi xảy ra khi tải dữ liệu... Vui lòng thử lại sau.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy trình đào tạo</h1>
        {/* Đã xoá dòng mô tả nhỏ dưới tiêu đề */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lộ trình học tập
          </CardTitle>
          {/* Đã xoá CardDescription */}
        </CardHeader>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {orderedExercises.length > 0 ? (
            orderedExercises.map((exercise, index) => (
              <TrainingStep
                key={exercise.id}
                exercise={exercise}
                stepNumber={index + 1}
                isLast={index === orderedExercises.length - 1}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Chưa có quy trình đào tạo nào được thiết lập</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Component cho mỗi bước đào tạo
interface TrainingStepProps {
  exercise: {
    id: string;
    title: string;
    is_required: boolean;
    min_study_sessions: number;
    min_review_videos: number;
  };
  stepNumber: number;
  isLast: boolean;
}

const TrainingStep: React.FC<TrainingStepProps> = ({
  exercise,
  stepNumber,
  isLast,
}) => {
  return (
    <div className="relative">
      <div className="flex items-start gap-4 p-4 rounded-lg border">
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
                {/* Đã xoá phần badge "Bắt buộc" theo yêu cầu */}
              </div>
              {/* Đã xoá phần yêu cầu học và video ôn tập theo yêu cầu */}
            </div>
          </div>
        </div>

        {/* Arrow to next step */}
        {!isLast && (
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
        )}
      </div>

      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-4 bg-border" />
      )}
    </div>
  );
};

export default TrainingProcessPage;