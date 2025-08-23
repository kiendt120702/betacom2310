import React, { useState, useMemo, useEffect } from 'react';
import { useQuizForExercise } from '@/hooks/useQuizzes';
import { useSubmitQuiz } from '@/hooks/useQuizSubmissions';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, FileText, Clock, PlayCircle } from 'lucide-react';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';
import { useEssayQuestions, EssayQuestion } from '@/hooks/useEssayQuestions';
import { useUserEssaySubmission, useSubmitEssayAnswers, useStartEssayTest } from '@/hooks/useEssaySubmissions';
import { Textarea } from '@/components/ui/textarea';

interface QuizViewProps {
  exercise: TrainingExercise;
  onQuizCompleted: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ exercise, onQuizCompleted }) => {
  // Multiple Choice Quiz state and hooks
  const { data: quizData, isLoading: mcqLoading } = useQuizForExercise(exercise.id);
  const { data: progress } = useUserExerciseProgress(exercise.id);
  const submitQuiz = useSubmitQuiz();
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Essay Quiz state and hooks
  const { data: essayQuestions, isLoading: essayLoading } = useEssayQuestions(exercise.id);
  const { data: essaySubmission, isLoading: submissionLoading, refetch: refetchSubmission } = useUserEssaySubmission(exercise.id);
  const submitEssay = useSubmitEssayAnswers();
  const startTest = useStartEssayTest();
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { updateProgress } = useUserExerciseProgress(exercise.id);

  useEffect(() => {
    if (essaySubmission?.started_at && !essaySubmission.submitted_at) {
      const startTime = new Date(essaySubmission.started_at).getTime();
      const endTime = startTime + (essaySubmission.time_limit_minutes || 30) * 60 * 1000;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);
        if (remaining === 0) {
          // Auto-submit or handle timeout
        }
      };

      updateTimer();
      const timerId = setInterval(updateTimer, 1000);
      return () => clearInterval(timerId);
    }
  }, [essaySubmission]);

  const handleEssayAnswerChange = (questionId: string, answer: string) => {
    setEssayAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleStartTest = () => {
    startTest.mutate({ exercise_id: exercise.id }, {
      onSuccess: () => {
        refetchSubmission();
      }
    });
  };

  const handleEssaySubmit = () => {
    if (!essaySubmission) return;
    const answersToSubmit = (essaySubmission.answers as any[]).map(q => ({
      question_id: q.id,
      answer: essayAnswers[q.id] || "",
    }));

    submitEssay.mutate({
      submission_id: essaySubmission.id,
      exercise_id: exercise.id,
      answers: answersToSubmit,
    }, {
      onSuccess: () => {
        updateProgress({
          exercise_id: exercise.id,
          quiz_passed: true,
        }).then(() => {
          onQuizCompleted();
        });
      }
    });
  };

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

  const isLoading = mcqLoading || essayLoading || submissionLoading;

  if (isLoading) {
    return <Card><CardContent className="p-6"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>;
  }

  // Render Essay Quiz if available
  if (essayQuestions && essayQuestions.length > 0) {
    if (!essaySubmission) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Bài test lý thuyết - Tự luận</CardTitle>
            <CardDescription>Bạn sẽ có 30 phút để trả lời 5 câu hỏi ngẫu nhiên.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleStartTest} disabled={startTest.isPending}>
              <PlayCircle className="h-4 w-4 mr-2" />
              {startTest.isPending ? "Đang tạo bài..." : "Bắt đầu làm bài"}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (essaySubmission.submitted_at) {
      const submittedAnswers = essaySubmission.answers as { id: string; content: string; answer?: string }[];
      return (
        <Card>
          <CardHeader>
            <CardTitle>Bài test lý thuyết - Tự luận</CardTitle>
            <CardDescription>Bạn đã nộp bài vào lúc {new Date(essaySubmission.submitted_at).toLocaleString('vi-VN')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {submittedAnswers.map((q, index) => (
              <div key={q.id} className="space-y-2">
                <p className="font-medium">{index + 1}. {q.content}</p>
                <Textarea
                  value={q.answer || ""}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    const questionsToDisplay = essaySubmission.answers as { id: string; content: string }[];
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bài test lý thuyết - Tự luận</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Thời gian còn lại: {timeLeft !== null ? `${Math.floor(timeLeft / 60000)}:${String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0')}` : '...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questionsToDisplay.map((q, index) => (
            <div key={q.id} className="space-y-2">
              <p className="font-medium">{index + 1}. {q.content}</p>
              <Textarea
                value={essayAnswers[q.id] || ""}
                onChange={(e) => handleEssayAnswerChange(q.id, e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                rows={4}
                disabled={timeLeft === 0}
              />
            </div>
          ))}
          <Button onClick={handleEssaySubmit} disabled={submitEssay.isPending || timeLeft === 0}>
            {submitEssay.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Nộp bài"}
          </Button>
          {timeLeft === 0 && <p className="text-red-500 text-sm mt-2">Đã hết thời gian làm bài. Vui lòng nộp bài.</p>}
        </CardContent>
      </Card>
    );
  }

  // Fallback to Multiple Choice Quiz
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