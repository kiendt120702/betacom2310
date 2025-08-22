import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, FileText, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrainingVideo from "./TrainingVideo";
import RecapTextArea from "./RecapTextArea";
import { useRecapManager } from "@/hooks/useRecapManager";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { TrainingExercise } from "@/types/training";
import { formatLearningTime } from "@/utils/learningUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizForExercise, useSubmitQuiz, useQuizSubmissions } from "@/hooks/useQuizzes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const secureLog = (message: string, data?: any) => {
  if (typeof window !== "undefined" && window.console) {
    console.log(`[ExerciseContent] ${message}`, data);
  }
};

interface ExerciseContentProps {
  exercise: TrainingExercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const sessionTimeSpentRef = useRef(0);
  const [activeTab, setActiveTab] = useState("lesson");

  const {
    data: userProgress,
    updateProgress,
    isLoading: progressLoading,
  } = useUserExerciseProgress(exercise.id);

  const recapManager = useRecapManager({
    exerciseId: exercise.id,
    onRecapSubmitted: () => {
      secureLog("Recap submitted successfully for exercise", exercise.id);
      setActiveTab("theory-test");
    },
  });

  const { data: quizData, isLoading: quizLoading } = useQuizForExercise(exercise.id);
  const { data: submissions, isLoading: submissionsLoading } = useQuizSubmissions(quizData?.id || null);
  const submitQuiz = useSubmitQuiz();
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    if (submissions && submissions.length > 0) {
      const lastSubmission = submissions[0];
      if (lastSubmission.passed) {
        setShowResult(true);
        setLastResult({ score: lastSubmission.score, passed: lastSubmission.passed });
      }
    }
  }, [submissions]);

  const isCompleted = useMemo(
    () => (userProgress && !Array.isArray(userProgress) ? userProgress.is_completed : false) || false,
    [userProgress]
  );

  const canCompleteExercise = useMemo(
    () => recapManager.hasSubmitted && (userProgress && !Array.isArray(userProgress) ? userProgress.quiz_passed : false) && !isCompleted,
    [recapManager.hasSubmitted, userProgress, isCompleted]
  );

  const saveTimeSpent = useCallback(async (seconds: number) => {
    if (seconds > 0) {
      const minutes = Math.round(seconds / 60);
      if (minutes > 0) {
        secureLog(`Saving ${minutes} minute(s) of watch time for exercise`, exercise.id);
        await updateProgress({
          exercise_id: exercise.id,
          time_spent: minutes,
        });
      }
    }
  }, [updateProgress, exercise.id]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (sessionTimeSpentRef.current > 0) {
        saveTimeSpent(sessionTimeSpentRef.current);
        sessionTimeSpentRef.current = 0;
      }
    }, 30000);

    return () => {
      clearInterval(saveInterval);
      saveTimeSpent(sessionTimeSpentRef.current);
    };
  }, [saveTimeSpent]);

  const handleSaveTimeSpent = useCallback((seconds: number) => {
    sessionTimeSpentRef.current += seconds;
  }, []);

  const handleVideoComplete = useCallback(() => {
    setHasWatchedVideo(true);
    secureLog("Video marked as watched");
    updateProgress({
      exercise_id: exercise.id,
      video_completed: true,
    });
  }, [updateProgress, exercise.id]);

  const handleCompleteExercise = useCallback(async () => {
    if (!canCompleteExercise) return;
    try {
      await saveTimeSpent(sessionTimeSpentRef.current);
      sessionTimeSpentRef.current = 0;
      await updateProgress({
        exercise_id: exercise.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      toast({ title: "Hoàn thành bài tập", description: "Bài tập đã hoàn thành! Đang chuyển sang bài tiếp theo..." });
      onComplete?.();
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể hoàn thành bài tập", variant: "destructive" });
    }
  }, [canCompleteExercise, exercise.id, updateProgress, onComplete, toast, queryClient, saveTimeSpent]);

  const handleQuizSubmit = async () => {
    if (!quizData) return;
    let correctAnswers = 0;
    quizData.questions.forEach(q => {
      const correctAnswer = q.answers.find(a => a.is_correct);
      if (correctAnswer && userAnswers[q.id] === correctAnswer.id) {
        correctAnswers++;
      }
    });
    const score = Math.round((correctAnswers / quizData.questions.length) * 100);
    const passed = score >= (quizData.passing_score || 80);
    
    setLastResult({ score, passed });
    setShowResult(true);

    await submitQuiz.mutateAsync({
      quiz_id: quizData.id,
      score,
      passed,
      answers: userAnswers,
    });

    if (passed) {
      await updateProgress({ exercise_id: exercise.id, quiz_passed: true });
      handleCompleteExercise();
    }
  };

  const sanitizedContent = useMemo(() => {
    if (!exercise.content) return "";
    return DOMPurify.sanitize(exercise.content, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "a"],
      ALLOWED_ATTR: ["href", "title", "target"],
      ALLOW_DATA_ATTR: false,
    });
  }, [exercise.content]);

  const timeSpent = (userProgress && !Array.isArray(userProgress) ? userProgress.time_spent : 0) || 0;

  if (progressLoading || recapManager.isLoading || quizLoading || submissionsLoading) {
    return <Card className="w-full"><CardContent className="p-6 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></CardContent></Card>;
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-none">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">{exercise.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          {isCompleted && <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /><span className="text-sm text-green-600 font-medium">Đã hoàn thành</span></div>}
          {timeSpent > 0 && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Tổng thời gian đã xem bài học: {formatLearningTime(timeSpent)}</span></div>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lesson">1. Bài học</TabsTrigger>
          <TabsTrigger value="theory-test" disabled={!recapManager.hasSubmitted}>2. Kiểm tra lý thuyết</TabsTrigger>
          <TabsTrigger value="practical-test" disabled>3. Kiểm tra thực hành</TabsTrigger>
        </TabsList>
        <TabsContent value="lesson" className="mt-4">
          <div className="space-y-4">
            {exercise.exercise_video_url && <TrainingVideo videoUrl={exercise.exercise_video_url} title={exercise.title} isCompleted={isCompleted} onVideoComplete={handleVideoComplete} onSaveTimeSpent={handleSaveTimeSpent} />}
            {sanitizedContent && <Card><CardHeader><CardTitle className="text-base md:text-lg">Nội dung bài học</CardTitle></CardHeader><CardContent><div className="prose prose-sm md:prose-base max-w-none [&>*]:break-words" dangerouslySetInnerHTML={{ __html: sanitizedContent }} /></CardContent></Card>}
            <RecapTextArea {...recapManager} />
          </div>
        </TabsContent>
        <TabsContent value="theory-test" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kiểm tra lý thuyết</CardTitle>
              <CardDescription>Hoàn thành bài test để hoàn thành bài học. Điểm đạt: {quizData?.passing_score || 80}%</CardDescription>
            </CardHeader>
            <CardContent>
              {quizData && !showResult && (
                <div className="space-y-6">
                  {quizData.questions.map((q, qIndex) => (
                    <div key={q.id} className="space-y-3">
                      <p className="font-medium">{qIndex + 1}. {q.content}</p>
                      <RadioGroup onValueChange={(value) => setUserAnswers(prev => ({ ...prev, [q.id]: value }))}>
                        {q.answers.map(a => (
                          <div key={a.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={a.id} id={`${q.id}-${a.id}`} />
                            <Label htmlFor={`${q.id}-${a.id}`}>{a.content}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button onClick={handleQuizSubmit} disabled={submitQuiz.isPending}>Nộp bài</Button>
                </div>
              )}
              {showResult && lastResult && (
                <Alert variant={lastResult.passed ? "default" : "destructive"}>
                  {lastResult.passed ? <CheckCircle className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
                  <AlertTitle>{lastResult.passed ? "Chúc mừng! Bạn đã qua bài test." : "Chưa đạt! Vui lòng thử lại."}</AlertTitle>
                  <AlertDescription>
                    Điểm của bạn: {lastResult.score}/100.
                    {!lastResult.passed && <Button variant="link" className="p-0 h-auto ml-2" onClick={() => { setShowResult(false); setUserAnswers({}); }}>Làm lại bài</Button>}
                  </AlertDescription>
                </Alert>
              )}
              {!quizData && <p className="text-muted-foreground">Bài tập này chưa có bài test.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="practical-test" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kiểm tra thực hành</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng này sẽ sớm được ra mắt.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExerciseContent;