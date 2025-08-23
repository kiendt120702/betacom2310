import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEssayQuestions, useCreateEssayQuestion, useUpdateEssayQuestion, useDeleteEssayQuestion, EssayQuestion } from "@/hooks/useEssayQuestions";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { TrainingExercise } from "@/types/training";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ManageEssayQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: TrainingExercise | null;
}

const ManageEssayQuestionsDialog: React.FC<ManageEssayQuestionsDialogProps> = ({ open, onClose, exercise }) => {
  const { data: questions = [], isLoading } = useEssayQuestions(exercise?.id || null);
  const createQuestion = useCreateEssayQuestion();
  const updateQuestion = useUpdateEssayQuestion();
  const deleteQuestion = useDeleteEssayQuestion();

  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<EssayQuestion | null>(null);

  useEffect(() => {
    if (editingQuestion) {
      setNewQuestionContent(editingQuestion.content);
    } else {
      setNewQuestionContent("");
    }
  }, [editingQuestion]);

  const handleSave = async () => {
    if (!newQuestionContent.trim() || !exercise) return;

    if (editingQuestion) {
      await updateQuestion.mutateAsync({ id: editingQuestion.id, content: newQuestionContent });
    } else {
      await createQuestion.mutateAsync({ exercise_id: exercise.id, content: newQuestionContent });
    }
    setEditingQuestion(null);
    setNewQuestionContent("");
  };

  const handleDelete = (questionId: string) => {
    deleteQuestion.mutate(questionId);
  };

  const isSubmitting = createQuestion.isPending || updateQuestion.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Quản lý câu hỏi tự luận</DialogTitle>
          <DialogDescription>
            Thêm, sửa, xóa câu hỏi cho bài tập: <strong>{exercise?.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="pb-4 border-b mb-4">
          <h4 className="font-medium mb-2">{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</h4>
          <Textarea
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            {editingQuestion && <Button variant="outline" onClick={() => setEditingQuestion(null)}>Hủy sửa</Button>}
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingQuestion ? "Lưu thay đổi" : "Thêm câu hỏi"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="flex items-start gap-4 p-3 border rounded-lg bg-muted/50">
                  <div className="font-medium">{index + 1}.</div>
                  <div className="flex-1">{q.content}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingQuestion(q)}><Edit className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>Bạn có chắc chắn muốn xóa câu hỏi này?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(q.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageEssayQuestionsDialog;