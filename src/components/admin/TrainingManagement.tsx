
import React, { useState } from "react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen, Users, Video, Upload, CheckCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateExerciseDialog from "./CreateExerciseDialog";
import EditExerciseDialog from "./EditExerciseDialog";

const TrainingManagement: React.FC = () => {
  const { data: exercises, isLoading } = useEduExercises();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const handleEditExercise = (exercise: any) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
      toast({
        title: "Thông báo",
        description: "Tính năng xóa bài tập sẽ được triển khai",
      });
    }
  };

  const handleUploadVideo = (exercise: any) => {
    // TODO: Implement video upload functionality
    toast({
      title: "Upload Video",
      description: `Chức năng upload video cho bài tập "${exercise.title}" sẽ được triển khai`,
    });
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đào tạo</h1>
          <p className="text-muted-foreground">
            Quản lý các bài tập kiến thức theo quy trình từng bước
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài tập mới
        </Button>
      </div>

      {exercises && exercises.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quy trình đào tạo
            </CardTitle>
            <CardDescription>
              Danh sách các bài tập kiến thức được sắp xếp theo thứ tự học từng bài một
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Tên bài tập</TableHead>
                    <TableHead className="w-32">Yêu cầu học</TableHead>
                    <TableHead className="w-32">Video ôn tập</TableHead>
                    <TableHead className="w-32">Video bài học</TableHead>
                    <TableHead className="w-32">Loại</TableHead>
                    <TableHead className="w-40 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((exercise, index) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{exercise.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {exercise.min_study_sessions} lần
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {exercise.min_review_videos} video
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {exercise.exercise_video_url ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Đã có
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUploadVideo(exercise)}
                              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Thay đổi video"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Thay đổi
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadVideo(exercise)}
                            className="h-8 px-3 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                          >
                            <Upload className="w-3 h-3 mr-2" />
                            Upload video
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={exercise.is_required ? "default" : "secondary"}>
                          {exercise.is_required ? "Bắt buộc" : "Tùy chọn"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExercise(exercise)}
                            className="h-8 w-8 p-0"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Chưa có bài tập nào</CardTitle>
            <CardDescription className="mb-4">
              Tạo bài tập kiến thức đầu tiên để bắt đầu xây dựng quy trình đào tạo
            </CardDescription>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo bài tập mới
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateExerciseDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {selectedExercise && (
        <EditExerciseDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
        />
      )}
    </div>
  );
};

export default TrainingManagement;
