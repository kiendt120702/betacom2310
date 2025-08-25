import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  PlayCircle, 
  BookOpen, 
  CheckCircle, 
  Clock,
  Users
} from "lucide-react";
import { useContentProtection } from "@/hooks/useContentProtection";
import FastPreviewVideoPlayer from "@/components/video/FastPreviewVideoPlayer";
import "@/styles/theory-content.css";
import { GeneralTrainingExercise } from "@/hooks/useGeneralTraining";

interface GeneralTrainingContentPageProps {
  exercise: GeneralTrainingExercise | null;
  onBack: () => void;
}

const GeneralTrainingContentPage: React.FC<GeneralTrainingContentPageProps> = ({ exercise: currentExercise, onBack }) => {
  useContentProtection();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Reset state when exercise changes
    setIsCompleted(false);
  }, [currentExercise]);

  const handleComplete = () => {
    setIsCompleted(true);
    // Here you could also save completion status to backend
  };

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chọn một bài học</h2>
            <p className="text-muted-foreground">
              Vui lòng chọn một bài học từ danh sách bên trái để bắt đầu.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Users className="h-7 w-7 md:h-8 md:w-8" />
          {currentExercise.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Đào tạo Chung
          </Badge>
          {isCompleted && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600">
              <CheckCircle className="h-3 w-3" />
              Đã hoàn thành
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Section */}
          {currentExercise.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Video học tập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-lg overflow-hidden">
                  <FastPreviewVideoPlayer
                    videoUrl={currentExercise.video_url}
                    title={currentExercise.title}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Theory Content */}
          {currentExercise.content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Nội dung lý thuyết
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <article className="theory-content">
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert px-8 py-6"
                    dangerouslySetInnerHTML={{ __html: currentExercise.content }}
                  />
                </article>
              </CardContent>
            </Card>
          )}

          {/* No Content Message */}
          {!currentExercise.video_url && !currentExercise.content && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">Nội dung đang được cập nhật</p>
                  <p className="text-sm">
                    Bài học này chưa có nội dung. Vui lòng quay lại sau hoặc liên hệ quản trị viên.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tiến độ học tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Trạng thái:</span>
                  <Badge variant={isCompleted ? "default" : "secondary"}>
                    {isCompleted ? "Hoàn thành" : "Đang học"}
                  </Badge>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              </div>

              {!isCompleted && (currentExercise.video_url || currentExercise.content) && (
                <Button 
                  onClick={handleComplete}
                  className="w-full"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Đánh dấu hoàn thành
                </Button>
              )}

              {isCompleted && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Chúc mừng! Bạn đã hoàn thành bài học này
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneralTrainingContentPage;