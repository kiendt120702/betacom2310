import React, { useState, useEffect } from 'react';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';
import { useActivePracticeTest } from '@/hooks/usePracticeTests';
import { usePracticeTestSubmissions, useSubmitPracticeTest } from '@/hooks/usePracticeTestSubmissions';
import { Textarea } from '@/components/ui/textarea';

interface PracticeTestViewProps {
  exercise: TrainingExercise;
}

const PracticeTestView: React.FC<PracticeTestViewProps> = ({ exercise }) => {
  const { data: practiceTest, isLoading: testLoading } = useActivePracticeTest(exercise.id);
  const { data: submissions, isLoading: submissionsLoading } = usePracticeTestSubmissions(practiceTest?.id || null);
  const submitMutation = useSubmitPracticeTest();

  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    if (submissions && submissions.length > 0) {
      setSubmissionText(submissions[0].submission_text || '');
    } else {
      setSubmissionText('');
    }
  }, [submissions]);

  const handleSubmit = () => {
    if (!practiceTest || !submissionText.trim()) return;
    submitMutation.mutate({
      practice_test_id: practiceTest.id,
      submission_text: submissionText.trim(),
    });
  };

  const isLoading = testLoading || submissionsLoading;
  const latestSubmission = submissions && submissions.length > 0 ? submissions[0] : null;

  if (isLoading) {
    return <Card><CardContent className="p-6"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>;
  }

  if (!practiceTest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bài tập thực hành</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bài học này không có bài tập thực hành.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{practiceTest.title}</CardTitle>
        <CardDescription>
          Đọc kỹ đề bài và nộp bài làm của bạn bằng nội dung văn bản.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg border">
          <h3 className="font-semibold mb-2">Đề bài:</h3>
          <p className="whitespace-pre-wrap">{practiceTest.content}</p>
        </div>

        {/* Display grading result if available */}
        {latestSubmission && latestSubmission.status === 'graded' && (
          <div className="p-4 rounded-lg border bg-green-50 border-green-200">
            <h3 className="font-semibold mb-2 text-green-800">Kết quả chấm bài</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Điểm số: </span>
                <span className="font-bold text-lg text-green-700">{latestSubmission.score}</span>
              </div>
              {latestSubmission.feedback && (
                <div>
                  <span className="font-medium">Nhận xét:</span>
                  <p className="text-sm text-green-900 whitespace-pre-wrap mt-1">{latestSubmission.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display pending status */}
        {latestSubmission && latestSubmission.status === 'pending' && (
          <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">Bài làm của bạn đã được nộp và đang chờ chấm điểm.</p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">
            {latestSubmission ? 'Cập nhật bài nộp của bạn:' : 'Bài nộp của bạn:'}
          </h3>
          <Textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Nhập bài làm thực hành dạng văn bản..."
            rows={8}
            disabled={submitMutation.isPending}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitMutation.isPending || !submissionText.trim()}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang nộp...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-2" />
                {submissions && submissions.length > 0 ? 'Cập nhật bài nộp' : 'Nộp bài'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeTestView;
