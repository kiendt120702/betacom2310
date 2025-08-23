import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGeneralTraining } from "@/hooks/useGeneralTraining";
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

const GeneralTrainingContentPage = () => {
  useContentProtection();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exerciseId = searchParams.get("exercise");
  
  const { data: exercises, isLoading } = useGeneralTraining();
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studyTime, setStudyTime] = useState(0);

  useEffect(() => {
    if (exercises && exerciseId) {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        setCurrentExercise(exercise);
      }
    }
  }, [exercises, exerciseId]);

  useEffect(() => {
    // Timer to track study time
    const interval = setInterval(() => {
      setStudyTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    setIsCompleted(true);
    // Here you could also save completion status to backend
  };

  const handleBack = () => {
    navigate("/general-training");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Không tìm thấy bài học này. Vui lòng thử lại.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              {currentExercise.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Đào tạo Chung
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Thời gian học: {formatTime(studyTime)}
              </Badge>
              {isCompleted && (
                <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Đã hoàn thành
                </Badge>
              )}
            </div>
          </div>
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
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: currentExercise.content }}
                />
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
          {/* Exercise Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bài học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Mô tả
                </h4>
                <p className="text-sm">
                  {currentExercise.description || "Không có mô tả"}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Có video:</span>
                <span className={currentExercise.video_url ? "text-green-600" : "text-orange-500"}>
                  {currentExercise.video_url ? "Có" : "Không"}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Có lý thuyết:</span>
                <span className={currentExercise.content ? "text-green-600" : "text-orange-500"}>
                  {currentExercise.content ? "Có" : "Không"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Thời gian học:</span>
                <span className="font-medium">{formatTime(studyTime)}</span>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-xs text-green-600 mt-1">
                    Thời gian học: {formatTime(studyTime)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full justify-start"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về danh sách bài học
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneralTrainingContentPage;