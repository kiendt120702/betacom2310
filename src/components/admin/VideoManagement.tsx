import React, { useState } from "react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Video, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { TrainingExercise } from "@/types/training";
import ExerciseVideoUploadDialog from "./ExerciseVideoUploadDialog";

const VideoManagement: React.FC = () => {
  const { data: exercises, isLoading, refetch } = useEduExercises();
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleOpenUploadDialog = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setIsUploadDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    refetch();
    setIsUploadDialogOpen(false);
    setSelectedExercise(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Quản lý Video bài học
          </CardTitle>
          <CardDescription>
            Thêm hoặc thay đổi video cho từng bài tập trong quy trình đào tạo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead>Trạng thái Video</TableHead>
                  <TableHead className="w-48 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExercises.map((exercise, index) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{exercise.title}</div>
                      {exercise.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {exercise.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {exercise.exercise_video_url ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Đã có video</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Chưa có video</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenUploadDialog(exercise)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {exercise.exercise_video_url ? "Thay đổi Video" : "Upload Video"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedExercise && (
        <ExerciseVideoUploadDialog
          exercise={selectedExercise}
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default VideoManagement;