
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingCourses, useTrainingVideos } from "@/hooks/useTrainingCourses";
import { BookOpen, Video, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrainingProcessPage = () => {
  const { data: courses, isLoading, error } = useTrainingCourses();
  
  // Tạo quy trình đào tạo dựa trên các khóa học
  const trainingSteps = courses?.map((course, index) => ({
    id: course.id,
    step: index + 1,
    title: course.title,
    description: course.description || "Nội dung đào tạo cơ bản",
    courseId: course.id
  })) || [];

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
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
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
        <p className="text-muted-foreground">
          Các bước đào tạo cần thực hiện theo thứ tự
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lộ trình học tập
          </CardTitle>
          <CardDescription>
            Hoàn thành các bước đào tạo theo thứ tự từ 1 đến {trainingSteps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trainingSteps.length > 0 ? (
            trainingSteps.map((step, index) => (
              <TrainingStep key={step.id} step={step} isLast={index === trainingSteps.length - 1} />
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
  step: {
    id: string;
    step: number;
    title: string;
    description: string;
    courseId: string;
  };
  isLast: boolean;
}

const TrainingStep: React.FC<TrainingStepProps> = ({ step, isLast }) => {
  const { data: videos } = useTrainingVideos(step.courseId);
  const firstVideo = videos?.[0];

  return (
    <div className="relative">
      <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        {/* Step Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
          {step.step}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
            </div>
            
            {/* Video Preview */}
            {firstVideo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                <Video className="h-4 w-4" />
                <span>Video học tập</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            )}
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
