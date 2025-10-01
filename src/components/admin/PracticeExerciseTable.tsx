import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { TrainingExercise } from "@/types/training";
import { PracticeTestSubmissionWithDetails } from "@/hooks/usePracticeTestSubmissions";

interface PracticeExerciseTableProps {
  exercises: TrainingExercise[];
  allSubmissions: PracticeTestSubmissionWithDetails[];
  onViewSubmissions: (exercise: TrainingExercise) => void;
}

const PracticeExerciseTable: React.FC<PracticeExerciseTableProps> = ({ exercises, allSubmissions, onViewSubmissions }) => {
  const submissionStats = useMemo(() => {
    const stats = new Map<string, { pending: number; graded: number }>();
    allSubmissions.forEach(submission => {
      const exerciseId = submission.practice_tests?.exercise_id;
      if (!exerciseId) return;
      
      const current = stats.get(exerciseId) || { pending: 0, graded: 0 };
      if (submission.status === 'pending') {
        current.pending++;
      } else if (submission.status === 'graded') {
        current.graded++;
      }
      stats.set(exerciseId, current);
    });
    return stats;
  }, [allSubmissions]);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">STT</TableHead>
            <TableHead>Tên bài tập</TableHead>
            <TableHead className="text-center">Số bài cần chấm</TableHead>
            <TableHead className="text-center">Số bài đã chấm</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise, index) => {
            const stats = submissionStats.get(exercise.id) || { pending: 0, graded: 0 };
            return (
              <TableRow key={exercise.id}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>{exercise.title}</TableCell>
                <TableCell className="text-center font-semibold text-orange-600">{stats.pending}</TableCell>
                <TableCell className="text-center font-semibold text-green-600">{stats.graded}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onViewSubmissions(exercise)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Xem bài nộp
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PracticeExerciseTable;