import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  BookOpen, 
  CheckCircle, 
} from "lucide-react";
import { useContentProtection } from "@/hooks/useContentProtection";
import OptimizedVideoPlayer from "@/components/video/OptimizedVideoPlayer";
import { useVideoOptimization } from "@/hooks/useVideoOptimization";
import "@/styles/training-interactions.css";
import { GeneralTrainingExercise } from "@/hooks/useGeneralTraining";

interface GeneralTrainingContentPageProps {
  exercise: GeneralTrainingExercise | null;
  onBack: () => void;
}

const GeneralTrainingContentPage: React.FC<GeneralTrainingContentPageProps> = ({ exercise: currentExercise, onBack }) => {
  useContentProtection();
  const [isCompleted, setIsCompleted] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const { processVideo, isProcessing } = useVideoOptimization();

  useEffect(() => {
    // Reset state when exercise changes
    setIsCompleted(false);
    setThumbnail(undefined);
  }, [currentExercise]);

  useEffect(() => {
    const optimizeVideo = async () => {
      if (!currentExercise?.video_url) return;
      
      const result = await processVideo(currentExercise.video_url, {
        generateThumbnail: true,
        thumbnailTime: 2,
        checkQuality: true
      });
      
      if (result.thumbnailUrl) {
        setThumbnail(result.thumbnailUrl);
      }
    };

    if (currentExercise?.video_url && !thumbnail && !isProcessing) {
      optimizeVideo();
    }
  }, [currentExercise?.video_url, processVideo, isProcessing, thumbnail]);

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
    <div className="h-full flex flex-col p-6">
      {/* Prominent Lesson Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{currentExercise.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {(currentExercise as any).tags?.map((tag: any) => (
            <span key={tag.id} className="px-2 py-1 bg-muted rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Video Section */}
      {currentExercise.video_url ? (
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-lg">
            <OptimizedVideoPlayer
              videoUrl={currentExercise.video_url}
              title={currentExercise.title}
              thumbnail={thumbnail}
              isCompleted={isCompleted}
              onVideoComplete={() => {
                console.log("Video considered complete for general training.");
              }}
              onSaveTimeSpent={(seconds) => {
                console.log(`Watched for ${seconds} seconds.`);
              }}
              mode="preview"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Nội dung đang được cập nhật</p>
              <p className="text-sm text-muted-foreground">
                Bài học này chưa có nội dung. Vui lòng quay lại sau hoặc liên hệ quản trị viên.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GeneralTrainingContentPage;