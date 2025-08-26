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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGradeEssaySubmission, EssaySubmissionWithDetails } from "@/hooks/useEssaySubmissions";
import { Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface GradeEssayDialogProps {
  submission: EssaySubmissionWithDetails;
  open: boolean;
  onClose: () => void;
}

const GradeEssayDialog: React.FC<GradeEssayDialogProps> = ({ submission, open, onClose }) => {
  const gradeMutation = useGradeEssaySubmission();
  const [answers, setAnswers] = useState<any[]>([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (submission.answers && Array.isArray(submission.answers)) {
      setAnswers(
        submission.answers
          .filter((a): a is { [key: string]: Json | undefined } => typeof a === 'object' && a !== null && !Array.isArray(a))
          .map(a => ({ 
            ...a, 
            score: typeof a.score === 'number' ? a.score : 0,
            feedback: typeof a.feedback === 'string' ? a.feedback : ''
          }))
      );
    }
    
    // Set existing grader feedback and overall score if already graded
    if (submission.grader_feedback) {
      setOverallFeedback(submission.grader_feedback);
    }
    if (typeof submission.score === 'number') {
      setOverallScore(submission.score);
    }
  }, [submission]);

  const handleAnswerChange = (index: number, field: 'score' | 'feedback', value: string | number) => {
    const newAnswers = [...answers];
    newAnswers[index][field] = value;
    setAnswers(newAnswers);
  };

  useEffect(() => {
    const totalScore = answers.reduce((sum, ans) => sum + (Number(ans.score) || 0), 0);
    setOverallScore(totalScore);
  }, [answers]);

  const handleSave = () => {
    gradeMutation.mutate({
      submissionId: submission.id,
      answers: answers,
      score: overallScore,
      grader_feedback: overallFeedback,
    }, {
      onSuccess: onClose,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chấm bài tự luận</DialogTitle>
          <DialogDescription>
            Học viên: {submission.profiles?.full_name || submission.profiles?.email} - 
            Bài tập: {submission.edu_knowledge_exercises?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            {answers.map((answer, index) => (
              <div key={answer.id} className="p-4 border rounded-lg space-y-4">
                <p className="font-medium">Câu {index + 1}: {answer.content}</p>
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-semibold mb-1">Bài làm của học viên:</p>
                  <p className="text-sm whitespace-pre-wrap">{answer.answer || "Không có câu trả lời"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
                  <div>
                    <Label>Điểm</Label>
                    <Input
                      type="number"
                      value={answer.score}
                      onChange={(e) => handleAnswerChange(index, 'score', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nhận xét</Label>
                    <Textarea
                      value={answer.feedback}
                      onChange={(e) => handleAnswerChange(index, 'feedback', e.target.value)}
                      placeholder="Nhận xét cho câu trả lời này..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium">Tổng kết</h3>
              <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
                <div>
                  <Label>Tổng điểm</Label>
                  <Input value={overallScore} readOnly className="mt-1 font-bold" />
                </div>
                <div>
                  <Label>Nhận xét chung</Label>
                  <Textarea
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    placeholder="Nhận xét chung cho toàn bộ bài làm..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} disabled={gradeMutation.isPending}>
            {gradeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu điểm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeEssayDialog;