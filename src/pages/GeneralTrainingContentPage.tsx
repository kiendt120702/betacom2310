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
    <div className="p-4 md:p-6">
      {/* Video Section */}
      {currentExercise.video_url ? (
        <div className="bg-black rounded-lg overflow-hidden">
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
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2">Nội dung đang được cập nhật</p>
          <p className="text-sm">
            Bài học này chưa có nội dung. Vui lòng quay lại sau hoặc liên hệ quản trị viên.
          </p>
        </div>
      )}
    </div>
  );
};

export default GeneralTrainingContentPage;