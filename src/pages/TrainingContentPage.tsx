
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Video } from "lucide-react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import ExerciseContent from "@/components/training/ExerciseContent";
import { secureLog } from "@/lib/utils";

interface EduExercise {
  id: string;
  title: string;
  description?: string;
  content?: string;
  exercise_video_url?: string;
  min_completion_time?: number;
  min_study_sessions: number;
  min_review_videos: number;
  required_review_videos: number;
  is_required: boolean;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const TrainingContentPage = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { data: exercises, isLoading } = useEduExercises();
  const [selectedExercise, setSelectedExercise] = useState<EduExercise | null>(null);

  React.useEffect(() => {
    if (exercises && exerciseId) {
      const exercise = exercises.find(ex => ex.id === exerciseId) as EduExercise | undefined;
      if (exercise) {
        setSelectedExercise(exercise);
      }
    } else if (exercises && exercises.length > 0) {
      setSelectedExercise(exercises[0] as EduExercise);
    }
  }, [exercises, exerciseId]);

  const handleExerciseComplete = () => {
    secureLog("Exercise completed successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chưa có bài tập nào</h2>
            <p className="text-gray-600 text-center">
              Hiện tại chưa có bài tập nào được tạo. Vui lòng liên hệ quản trị viên.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Exercise List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Danh sách bài tập
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exercises.map((exercise) => {
                const ex = exercise as EduExercise;
                return (
                  <Button
                    key={ex.id}
                    variant={selectedExercise?.id === ex.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{ex.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        {ex.min_completion_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ex.min_completion_time} phút
                          </span>
                        )}
                        {ex.exercise_video_url && (
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Exercise Content */}
        <div className="lg:col-span-3">
          {selectedExercise ? (
            <ExerciseContent
              exercise={selectedExercise}
              onComplete={handleExerciseComplete}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Chọn bài tập</h2>
                <p className="text-gray-600 text-center">
                  Vui lòng chọn một bài tập từ danh sách bên trái để bắt đầu học.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingContentPage;
