import React, { useState, useMemo } from "react";
import { useEduExercises, useDeleteEduExercise } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, BookOpen, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CreateExerciseDialog from "./CreateExerciseDialog";
import EditExerciseDialog from "./EditExerciseDialog";
import ExercisePermissionsDialog from "./ExercisePermissionsDialog";
import ManageQuizDialog from "./ManageQuizDialog";
import { TrainingExercise } from "@/types/training";
import { supabase } from "@/integrations/supabase/client";

const GeneralTrainingManagement: React.FC = () => {
  const { data: allExercises, isLoading, refetch } = useEduExercises();
  const deleteExerciseMutation = useDeleteEduExercise();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedExerciseForPermissions, setSelectedExerciseForPermissions] = useState<TrainingExercise | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [selectedExerciseForQuiz, setSelectedExerciseForQuiz] = useState<TrainingExercise | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const generalExercises = useMemo(() => {
    if (!allExercises) return [];
    return allExercises.filter(ex => 
      (!ex.target_roles || ex.target_roles.length === 0) && 
      (!ex.target_team_ids || ex.target_team_ids.length === 0)
    ).sort((a, b) => a.order_index - b.order_index);
  }, [allExercises]);

  React.useEffect(() => {
    const loadQuizzes = async () => {
      setDataLoading(true);
      try {
        const { data: quizzesData, error: quizzesError } = await supabase.from('edu_quizzes').select('exercise_id');
        if (quizzesError) throw quizzesError;
        setQuizzes(quizzesData || []);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setDataLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  const handleEditExercise = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    await deleteExerciseMutation.mutateAsync(exerciseId);
  };

  const handlePermissions = (exercise: TrainingExercise) => {
    setSelectedExerciseForPermissions(exercise);
    setPermissionsDialogOpen(true);
  };

  const handleManageQuiz = (exercise: TrainingExercise) => {
    setSelectedExerciseForQuiz(exercise);
    setQuizDialogOpen(true);
  };

  const hasQuiz = (exerciseId: string) => quizzes.some(quiz => quiz.exercise_id === exerciseId);

  if (isLoading || dataLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đào tạo Chung</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các bài học và tài liệu đào tạo chung cho tất cả người dùng.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài tập chung
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Danh sách bài tập chung
          </CardTitle>
          <CardDescription>
            Các bài tập này sẽ hiển thị cho tất cả người dùng không phân biệt vai trò hay phòng ban.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generalExercises.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Tên bài tập</TableHead>
                    <TableHead className="text-center">Video</TableHead>
                    <TableHead className="text-center">Lý thuyết</TableHead>
                    <TableHead className="text-center">Quiz</TableHead>
                    <TableHead className="w-40 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generalExercises.map((exercise, index) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{exercise.title}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        {exercise.exercise_video_url ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {exercise.content && exercise.content.trim() ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasQuiz(exercise.id) ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handlePermissions(exercise)} className="h-8 w-8 p-0" title="Phân quyền"><Shield className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditExercise(exercise)} className="h-8 w-8 p-0" title="Chỉnh sửa"><Edit className="w-4 h-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Xóa" disabled={deleteExerciseMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
                                <AlertDialogDescription>Bạn có chắc chắn muốn xóa bài tập "{exercise.title}"?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExercise(exercise.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteExerciseMutation.isPending}>
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
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có bài tập chung nào.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateExerciseDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      {selectedExercise && <EditExerciseDialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setSelectedExercise(null); }} exercise={selectedExercise} />}
      <ExercisePermissionsDialog open={permissionsDialogOpen} onClose={() => { setPermissionsDialogOpen(false); setSelectedExerciseForPermissions(null); refetch(); }} exercise={selectedExerciseForPermissions} />
      {selectedExerciseForQuiz && <ManageQuizDialog open={quizDialogOpen} onClose={() => { setQuizDialogOpen(false); setSelectedExerciseForQuiz(null); }} exercise={selectedExerciseForQuiz} />}
    </div>
  );
};

export default GeneralTrainingManagement;