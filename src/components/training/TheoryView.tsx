import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, CheckCircle, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import { TrainingExercise } from '@/types/training';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';
import { useToast } from '@/hooks/use-toast';
import { formatLearningTime } from '@/utils/learningUtils';

interface TheoryViewProps {
  exercise: TrainingExercise;
}

const TheoryView: React.FC<TheoryViewProps> = ({ exercise }) => {
  const { toast } = useToast();
  const { data: userProgress, updateProgress, isLoading: progressLoading } = useUserExerciseProgress(exercise.id);

  const isTheoryRead = useMemo(
    () => (userProgress && !Array.isArray(userProgress) ? userProgress.theory_read : false) || false,
    [userProgress]
  );
  const timeSpent = (userProgress && !Array.isArray(userProgress) ? userProgress.time_spent : 0) || 0;

  const sanitizedContent = useMemo(() => {
    if (!exercise.content) return "";
    return DOMPurify.sanitize(exercise.content, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "blockquote", "a", "img", "div", "span", "code", "pre",
        "table", "thead", "tbody", "tr", "th", "td"
      ],
      ALLOWED_ATTR: ["href", "title", "target", "src", "alt", "class", "style"],
      ALLOW_DATA_ATTR: false,
    });
  }, [exercise.content]);

  const handleMarkAsRead = useCallback(async () => {
    try {
      await updateProgress({
        exercise_id: exercise.id,
        theory_read: true,
      });
      toast({
        title: "Thành công",
        description: "Bạn đã đánh dấu lý thuyết là đã đọc.",
      });
    } catch (error) {
      console.error("Error marking theory as read:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu lý thuyết là đã đọc.",
        variant: "destructive",
      });
    }
  }, [exercise.id, updateProgress, toast]);

  if (progressLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exercise.content) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Lý thuyết bài học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bài tập này không có nội dung lý thuyết.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-none">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">{exercise.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          {isTheoryRead && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Đã đọc</span>
            </div>
          )}
          {timeSpent > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tổng thời gian đã xem bài học: {formatLearningTime(timeSpent)}
              </span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Nội dung lý thuyết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm md:prose-base max-w-none [&>*]:break-words"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </CardContent>
      </Card>

      {!isTheoryRead && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleMarkAsRead} disabled={progressLoading}>
            <CheckCircle className="h-5 w-5 mr-2" />
            Đánh dấu đã đọc
          </Button>
        </div>
      )}
    </div>
  );
};

export default TheoryView;