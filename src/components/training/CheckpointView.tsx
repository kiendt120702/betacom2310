import React, { useState, useEffect } from 'react';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useEssayQuestions } from '@/hooks/useEssayQuestions';
import { useSubmitCheckpoint, useUserCheckpointSubmissions } from '@/hooks/useCheckpointSubmissions';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';

interface CheckpointViewProps {
  exercise: TrainingExercise;
  onCheckpointCompleted: () => void;
}

const CheckpointView: React.FC<CheckpointViewProps> = ({ exercise, onCheckpointCompleted }) => {
  const { data: questions, isLoading: questionsLoading } = useEssayQuestions(exercise.id);
  const { data: submissions, isLoading: submissionsLoading } = useUserCheckpointSubmissions();
  const submitCheckpoint = useSubmitCheckpoint();
  const { updateProgress } = useUserExerciseProgress(exercise.id);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const hasSubmitted = submissions?.some(s => s.exercise_id === exercise.id);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!questions) return;

    const collectedAnswers = questions.map(q => ({
      id: q.id,
      content: q.content,
      answer: answers[q.id] || "",
    }));

    submitCheckpoint.mutate({ exercise_id: exercise.id, answers: collectedAnswers }, {
      onSuccess: () => {
        updateProgress({ exercise_id: exercise.id, is_completed: true, completed_at: new Date().toISOString() });
        onCheckpointCompleted();
      }
    });
  };

  const isLoading = questionsLoading || submissionsLoading;

  if (isLoading) {
    return <Card><CardContent className="p-6"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>;
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoàn thành</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="font-semibold">Bạn đã hoàn thành bài kiểm tra này.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.title}</CardTitle>
        <CardDescription>Trả lời các câu hỏi sau để tiếp tục.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions?.map((q, index) => (
          <div key={q.id} className="space-y-2">
            <p className="font-medium">{index + 1}. {q.content}</p>
            <Textarea
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              rows={5}
              disabled={submitCheckpoint.isPending}
            />
          </div>
        ))}
        <Button onClick={handleSubmit} disabled={submitCheckpoint.isPending || Object.values(answers).some(a => !a.trim())}>
          {submitCheckpoint.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Nộp bài
        </Button>
      </CardContent>
    </Card>
  );
};

export default CheckpointView;