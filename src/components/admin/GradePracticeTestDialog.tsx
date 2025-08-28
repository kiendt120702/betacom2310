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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGradePracticeTest, PracticeTestSubmissionWithDetails } from "@/hooks/usePracticeTestSubmissions";
import { Loader2 } from "lucide-react";
import LazyImage from "@/components/LazyImage";

interface GradePracticeTestDialogProps {
  submission: PracticeTestSubmissionWithDetails;
  open: boolean;
  onClose: () => void;
}

const GradePracticeTestDialog: React.FC<GradePracticeTestDialogProps> = ({ submission, open, onClose }) => {
  const gradeMutation = useGradePracticeTest();
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [score, setScore] = useState(submission.score || 0);

  useEffect(() => {
    setFeedback(submission.feedback || "");
    setScore(submission.score || 0);
  }, [submission]);

  const handleSave = () => {
    gradeMutation.mutate({
      submissionId: submission.id,
      score: score,
      feedback: feedback,
    }, {
      onSuccess: onClose,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chấm bài thực hành</DialogTitle>
          <DialogDescription>
            Học viên: {submission.profiles?.full_name || submission.profiles?.email} - 
            Bài tập: {submission.practice_tests?.edu_knowledge_exercises?.title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Bài làm của học viên:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                {submission.image_urls.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square block">
                    <LazyImage src={url} alt={`Ảnh nộp ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                  </a>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium">Chấm điểm và nhận xét</h3>
              <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
                <div>
                  <Label>Điểm</Label>
                  <Input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Nhận xét</Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhận xét cho bài làm..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
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

export default GradePracticeTestDialog;