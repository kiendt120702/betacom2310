import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Edit } from "lucide-react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useAllEssayQuestions } from "@/hooks/useEssayQuestions";
import { TrainingExercise } from "@/types/training";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ManageEssayQuestionsDialog from "./ManageEssayQuestionsDialog";

const TheoryTestManagement: React.FC = () => {
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: allQuestions, isLoading: questionsLoading } = useAllEssayQuestions();
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const questionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (allQuestions) {
      for (const question of allQuestions) {
        counts.set(question.exercise_id, (counts.get(question.exercise_id) || 0) + 1);
      }
    }
    return counts;
  }, [allQuestions]);

  const handleManageQuestions = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setIsDialogOpen(true);
  };

  const isLoading = exercisesLoading || questionsLoading;

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  const sortedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quản lý Bài tập lý thuyết (Tự luận)
          </CardTitle>
          <CardDescription>
            Quản lý ngân hàng câu hỏi tự luận cho từng bài học. Hệ thống sẽ lấy ngẫu nhiên số câu hỏi đúng bằng cấu hình của từng bài khi kiểm tra người dùng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Tên bài học</TableHead>
                  <TableHead className="text-center">Số câu hỏi đã tạo</TableHead>
                  <TableHead className="w-48 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExercises.map((exercise, index) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell>{exercise.title}</TableCell>
                    <TableCell className="text-center font-medium">
                      {questionCounts.get(exercise.id) || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleManageQuestions(exercise)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Quản lý câu hỏi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ManageEssayQuestionsDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        exercise={selectedExercise}
      />
    </>
  );
};

export default TheoryTestManagement;
