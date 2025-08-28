import React, { useState, useEffect } from 'react';
import { TrainingExercise } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';
import { useActivePracticeTest } from '@/hooks/usePracticeTests';
import { usePracticeTestSubmissions, useSubmitPracticeTest } from '@/hooks/usePracticeTestSubmissions';
import MultiImageUpload from '@/components/MultiImageUpload';

interface PracticeTestViewProps {
  exercise: TrainingExercise;
}

const PracticeTestView: React.FC<PracticeTestViewProps> = ({ exercise }) => {
  const { data: practiceTest, isLoading: testLoading } = useActivePracticeTest(exercise.id);
  const { data: submissions, isLoading: submissionsLoading } = usePracticeTestSubmissions(practiceTest?.id || null);
  const submitMutation = useSubmitPracticeTest();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (submissions && submissions.length > 0) {
      setImageUrls(submissions[0].image_urls);
    } else {
      setImageUrls([]);
    }
  }, [submissions]);

  const handleSubmit = () => {
    if (!practiceTest || imageUrls.length === 0) return;
    submitMutation.mutate({
      practice_test_id: practiceTest.id,
      image_urls: imageUrls,
    });
  };

  const isLoading = testLoading || submissionsLoading;

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
          Đọc kỹ đề bài và nộp bài làm của bạn dưới dạng hình ảnh.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg border">
          <h3 className="font-semibold mb-2">Đề bài:</h3>
          <p className="whitespace-pre-wrap">{practiceTest.content}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Bài nộp của bạn:</h3>
          <MultiImageUpload
            imageUrls={imageUrls}
            onImageUrlsChange={setImageUrls}
            disabled={submitMutation.isPending}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitMutation.isPending || imageUrls.length === 0}>
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