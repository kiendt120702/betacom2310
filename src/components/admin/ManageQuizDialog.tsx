import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuizForExercise, useUpsertQuizWithRelations, QuizData } from "@/hooks/useQuizzes";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { TrainingExercise } from "@/types/training";

interface ManageQuizDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: TrainingExercise | null;
}

const ManageQuizDialog: React.FC<ManageQuizDialogProps> = ({ open, onClose, exercise }) => {
  const { data: quizData, isLoading } = useQuizForExercise(exercise?.id || null);
  const upsertQuiz = useUpsertQuizWithRelations();

  const { control, handleSubmit, reset, register } = useForm<QuizData>({
    defaultValues: {
      title: "",
      passing_score: 80,
      questions: [],
    },
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    if (quizData) {
      reset(quizData);
    } else if (exercise) {
      reset({
        exercise_id: exercise.id,
        title: `Bài test cho: ${exercise.title}`,
        passing_score: 80,
        questions: [],
      });
    }
  }, [quizData, exercise, reset]);

  const onSubmit = (data: QuizData) => {
    if (!exercise) return;
    upsertQuiz.mutate({ ...data, exercise_id: exercise.id }, {
      onSuccess: onClose,
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Quản lý bài test</DialogTitle>
          <DialogDescription>
            Tạo và chỉnh sửa bài test cho bài tập: <strong>{exercise?.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-6 -mr-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Tiêu đề bài test</Label>
                  <Input id="quiz-title" {...register("title")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passing-score">Điểm đạt (%)</Label>
                  <Input id="passing-score" type="number" min="0" max="100" {...register("passing_score")} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Câu hỏi</h3>
                {questions.map((question, qIndex) => (
                  <QuestionField key={question.id} qIndex={qIndex} control={control} removeQuestion={removeQuestion} />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendQuestion({
                    id: `temp-${Date.now()}`,
                    content: "",
                    question_type: 'single_choice',
                    answers: [],
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
                </Button>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={upsertQuiz.isPending}>
              {upsertQuiz.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu bài test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const QuestionField = ({ qIndex, control, removeQuestion }: any) => {
  const { fields: answers, append: appendAnswer, remove: removeAnswer } = useFieldArray({
    control,
    name: `questions.${qIndex}.answers`,
  });

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
      <div className="flex items-center justify-between">
        <Label>Câu hỏi {qIndex + 1}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      <Input placeholder="Nội dung câu hỏi" {...register(`questions.${qIndex}.content`)} />
      
      <div className="space-y-2 pl-4">
        <Label>Các câu trả lời</Label>
        {answers.map((answer, aIndex) => (
          <div key={answer.id} className="flex items-center gap-2">
            <Controller
              name={`questions.${qIndex}.answers.${aIndex}.is_correct`}
              control={control}
              render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Input placeholder={`Câu trả lời ${aIndex + 1}`} {...register(`questions.${qIndex}.answers.${aIndex}.content`)} />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeAnswer(aIndex)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => appendAnswer({ id: `temp-ans-${Date.now()}`, content: "", is_correct: false })}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm câu trả lời
        </Button>
      </div>
    </div>
  );
};

export default ManageQuizDialog;