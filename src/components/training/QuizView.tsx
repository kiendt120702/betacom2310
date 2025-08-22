import React, { useState, useMemo } from 'react';
import { useQuizForExercise } from '@/hooks/useQuizzes';
import { useSubmitQuiz } from '@/hooks/useQuizSubmissions';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';

interface QuizViewProps {
  exercise: TrainingExercise;
  onQuizCompleted: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ exercise, onQuizCompleted }) => {
  const { data: quizData, isLoading } = useQuizForExercise(exercise.id);
  const { data: progress } = useUserExerciseProgress(exercise.id);
  const submitQuiz = useSubmitQuiz();
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const isQuizPassed = useMemo(() => progress && !Array.isArray(progress) && progress.quiz_passed, [progress]);

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = () => {
    if (!quizData) return;

    let correctCount = 0;
    const detailedAnswers: { question_id: string; answer_id: string; is_correct: boolean }[] = [];

    quizData.questions.forEach(q => {
      const userAnswerId = userAnswers[q.id];
      const correctAnswer = q.answers.find(a => a.is_correct);
      const isCorrect = userAnswerId === correctAnswer?.id;
      if (isCorrect) {
        correctCount++;
      }
      detailedAnswers.push({
        question_id: q.id,
        answer_id: userAnswerId,
        is_correct: isCorrect,
      });
    });

    const calculatedScore = (correctCount / quizData.questions.length) * 100;
    const passed = calculatedScore >= (quizData.passing_score || 80);
    
    setScore(calculatedScore);
    setSubmitted(true);

    submitQuiz.mutate({
      quiz_id: quizData.id,
      exercise_id: exercise.id,
      score: calculatedScore,
      passed,
      answers: detailedAnswers,
    }, {
      onSuccess: () => {
        if (passed) {
          onQuizCompleted();
        }
      }
    });
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>;
  }

  if (!quizData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bài test lý thuyết</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bài tập này không có bài test lý thuyết.</p>
        </CardContent>
      </Card>
    );
  }

  if (isQuizPassed && !submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bài test lý thuyết</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="font-semibold">Bạn đã hoàn thành bài test này.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quizData.title}</CardTitle>
        <CardDescription>Hoàn thành bài test để tiếp tục. Điểm đạt: {quizData.passing_score}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quizData.questions.map((q, qIndex) => (
          <div key={q.id} className="space-y-2">
            <p className="font-medium">{qIndex + 1}. {q.content}</p>
            <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)} disabled={submitted}>
              {q.answers.map(a => (
                <div key={a.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={a.id} id={`${q.id}-${a.id}`} />
                  <Label htmlFor={`${q.id}-${a.id}`}>{a.content}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
        
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={Object.keys(userAnswers).length !== quizData.questions.length || submitQuiz.isPending}>
            {submitQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Nộp bài"}
          </Button>
        ) : (
          <div className={`p-4 rounded-md ${score! >= quizData.passing_score ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-bold text-lg">Kết quả: {score?.toFixed(0)}% - {score! >= quizData.passing_score ? "Đạt" : "Chưa đạt"}</h3>
            {score! < quizData.passing_score && <p>Bạn cần xem lại video và làm lại bài test.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizView;