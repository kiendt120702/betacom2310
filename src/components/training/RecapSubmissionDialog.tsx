import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitRecap, useGetExerciseRecap } from "@/hooks/useExerciseRecaps";
import { FileText } from "lucide-react";

interface RecapSubmissionDialogProps {
  exerciseId: string;
  exerciseTitle: string;
  children: React.ReactNode;
  onRecapSubmitted?: () => void;
}

const RecapSubmissionDialog = ({ 
  exerciseId, 
  exerciseTitle, 
  children,
  onRecapSubmitted 
}: RecapSubmissionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [recapContent, setRecapContent] = useState("");
  
  const { data: existingRecap } = useGetExerciseRecap(exerciseId);
  const submitRecap = useSubmitRecap();

  useEffect(() => {
    if (open && existingRecap) {
      setRecapContent(existingRecap.recap_content);
    } else if (open) {
      setRecapContent("");
    }
  }, [existingRecap, open]);

  const handleSubmit = () => {
    if (!recapContent.trim()) return;

    submitRecap.mutate({
      exercise_id: exerciseId,
      recap_content: recapContent,
    }, {
      onSuccess: () => {
        setOpen(false);
        onRecapSubmitted?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gửi tóm tắt bài học</DialogTitle>
          <DialogDescription>
            Hãy viết tóm tắt những điều bạn đã học được từ bài: {exerciseTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="recap-content">Nội dung tóm tắt *</Label>
            <Textarea
              id="recap-content"
              placeholder="Hãy tóm tắt những kiến thức chính mà bạn đã học được từ bài học này..."
              value={recapContent}
              onChange={(e) => setRecapContent(e.target.value)}
              rows={6}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tối thiểu 50 ký tự để gửi tóm tắt
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={recapContent.trim().length < 50 || submitRecap.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              {submitRecap.isPending ? "Đang gửi..." : existingRecap ? "Cập nhật recap" : "Gửi recap"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecapSubmissionDialog;