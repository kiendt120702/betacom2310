import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, BookOpen, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { TrainingExercise } from "@/types/training";
import { useAllQuizzes } from "@/hooks/useQuizzes";
import { useAllEssayQuestions } from "@/hooks/useEssayQuestions";
import { useAllPracticeTests } from "@/hooks/usePracticeTests";
import { useDeleteEduExercise } from "@/hooks/useEduExercises";

interface TrainingOverviewProps {
  exercises: TrainingExercise[];
  onEdit: (exercise: TrainingExercise) => void;
  onPermissions: (exercise: TrainingExercise) => void;
}

const TrainingOverview: React.FC<TrainingOverviewProps> = ({ exercises, onEdit, onPermissions }) => {
  const { data: quizzes = [], isLoading: quizzesLoading } = useAllQuizzes();
  const { data: practiceTests = [], isLoading: practiceTestsLoading } = useAllPracticeTests();
  const { data: essayQuestions = [], isLoading: essayQuestionsLoading } = useAllEssayQuestions();
  const deleteExerciseMutation = useDeleteEduExercise();

  const hasQuiz = (exerciseId: string) =>
    quizzes.some((quiz) => quiz.exercise_id === exerciseId) ||
    essayQuestions.some((q) => q.exercise_id === exerciseId);

  const hasPracticeTest = (exerciseId: string) =>
    practiceTests.some(
      (test) => test.exercise_id === exerciseId && test.is_active,
    );

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await deleteExerciseMutation.mutateAsync(exerciseId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const isLoading = quizzesLoading || practiceTestsLoading || essayQuestionsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Quy trình đào tạo Edu Shopee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên bài tập</TableHead>
                <TableHead className="text-center">Video</TableHead>
                <TableHead className="text-center">Số lần xem YC</TableHead>
                <TableHead className="text-center">Quiz</TableHead>
                <TableHead className="text-center">Thực hành</TableHead>
                <TableHead className="text-center">Video ôn tập</TableHead>
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
                  <TableCell className="text-center">
                    {exercise.exercise_video_url ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {exercise.required_viewing_count} lần
                  </TableCell>
                  <TableCell className="text-center">
                    {isLoading ? '...' : hasQuiz(exercise.id) ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {isLoading ? '...' : hasPracticeTest(exercise.id) ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {exercise.min_review_videos > 0 ? `${exercise.min_review_videos} video` : 'Không'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => onPermissions(exercise)} className="h-8 w-8 p-0" title="Phân quyền"><Shield className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(exercise)} className="h-8 w-8 p-0" title="Chỉnh sửa"><Edit className="w-4 h-4" /></Button>
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
      </CardContent>
    </Card>
  );
};

export default TrainingOverview;