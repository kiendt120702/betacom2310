import React, { useState } from "react";
import { useEduExercises, useDeleteEduExercise } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen, Users, Video, Upload, CheckCircle, Play, Shield, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CreateExerciseDialog from "./CreateExerciseDialog";
import EditExerciseDialog from "./EditExerciseDialog";
import ExerciseVideoUploadDialog from "./ExerciseVideoUploadDialog";
import ExercisePermissionsDialog from "./ExercisePermissionsDialog";
import ManageQuizDialog from "./ManageQuizDialog";
import { TrainingExercise } from "@/types/training";

const TrainingManagement: React.FC = () => {
  const { data: exercises, isLoading } = useEduExercises();
  const { toast } = useToast();
  const deleteExerciseMutation = useDeleteEduExercise();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedExerciseForPermissions, setSelectedExerciseForPermissions] = useState<TrainingExercise | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [selectedExerciseForQuiz, setSelectedExerciseForQuiz] = useState<TrainingExercise | null>(null);

  const handleEditExercise = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await deleteExerciseMutation.mutateAsync(exerciseId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePermissions = (exercise: TrainingExercise) => {
    setSelectedExerciseForPermissions(exercise);
    setPermissionsDialogOpen(true);
  };

  const handleManageQuiz = (exercise: TrainingExercise) => {
    setSelectedExerciseForQuiz(exercise);
    setQuizDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đào tạo</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài học mới
        </Button>
      </div>

      {exercises && exercises.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quy trình đào tạo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Tên bài học</TableHead>
                    <TableHead>Video bài học</TableHead>
                    <TableHead>Bài test</TableHead>
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
                        {exercise.exercise_video_url ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Đã có
                            </Badge>
                            <ExerciseVideoUploadDialog exercise={exercise}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Thay đổi video"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Thay đổi
                              </Button>
                            </ExerciseVideoUploadDialog>
                          </div>
                        ) : (
                          <ExerciseVideoUploadDialog exercise={exercise}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                            >
                              <Upload className="w-3 h-3 mr-2" />
                              Upload video
                            </Button>
                          </ExerciseVideoUploadDialog>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageQuiz(exercise)}
                        >
                          <FileText className="w-3 h-3 mr-2" />
                          Quản lý Test
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePermissions(exercise)}
                            className="h-8 w-8 p-0"
                            title="Phân quyền"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExercise(exercise)}
                            className="h-8 w-8 p-0"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Xóa"
                                disabled={deleteExerciseMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa bài tập "{exercise.title}"? Hành động này sẽ xóa vĩnh viễn bài tập và mọi dữ liệu liên quan (bao gồm bài test và tiến độ học tập của người dùng).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteExercise(exercise.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deleteExerciseMutation.isPending}
                                >
                                  {deleteExerciseMutation.isPending ? "Đang xóa..." : "Xóa"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      <ExercisePermissionsDialog
        open={permissionsDialogOpen}
        onClose={() => {
          setPermissionsDialogOpen(false);
          setSelectedExerciseForPermissions(null);
        }}
        exercise={selectedExerciseForPermissions}
      />

      {selectedExerciseForQuiz && (
        <ManageQuizDialog
          open={quizDialogOpen}
          onClose={() => {
            setQuizDialogOpen(false);
            setSelectedExerciseForQuiz(null);
          }}
          exercise={selectedExerciseForQuiz}
        />
      )}
    </div>
  );
};

export default TrainingManagement;