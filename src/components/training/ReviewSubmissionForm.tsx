
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useCreateReviewSubmission } from "@/hooks/useExerciseReviewSubmissions";
import { Upload, Link } from "lucide-react";

interface ReviewSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExerciseId?: string;
}

const ReviewSubmissionForm = ({ 
  open, 
  onOpenChange, 
  selectedExerciseId 
}: ReviewSubmissionFormProps) => {
  const [exerciseId, setExerciseId] = useState(selectedExerciseId || "");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: exercises } = useEduExercises();
  const { mutate: createSubmission, isPending } = useCreateReviewSubmission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseId || !content.trim() || !videoUrl.trim()) {
      return;
    }

    createSubmission({
      exercise_id: exerciseId,
      content: content.trim(),
      video_url: videoUrl.trim(),
    }, {
      onSuccess: () => {
        setContent("");
        setVideoUrl("");
        if (!selectedExerciseId) {
          setExerciseId("");
        }
        onOpenChange(false);
      }
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes('drive.google.com') || url.includes('youtube.com') || url.includes('youtu.be');
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Nộp Video Ôn Tập
          </DialogTitle>
          <DialogDescription>
            Nộp video ôn tập cho bài tập kiến thức. Mỗi bài tập cần đủ số lượng video theo quy định.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedExerciseId && (
            <div className="space-y-2">
              <Label htmlFor="exercise">Chọn bài tập *</Label>
              <Select value={exerciseId} onValueChange={setExerciseId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bài tập cần nộp video..." />
                </SelectTrigger>
                <SelectContent>
                  {exercises?.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung ôn tập *</Label>
            <Textarea
              id="content"
              placeholder="Mô tả nội dung bài ôn tập của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Link video ôn tập *</Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://drive.google.com/... hoặc YouTube link"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {videoUrl && !isValidUrl(videoUrl) && (
              <p className="text-sm text-red-500">
                Vui lòng nhập link Google Drive hoặc YouTube hợp lệ
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isPending || !exerciseId || !content.trim() || !videoUrl.trim() || !isValidUrl(videoUrl)}
          >
            {isPending ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionForm;
