import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEduExercises, useUpdateEduExercise } from "@/hooks/useEduExercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  BookOpen, 
  Save,
  Eye,
  Clock,
  FileText
} from "lucide-react";
import { useContentProtection } from "@/hooks/useContentProtection";
import { useToast } from "@/hooks/use-toast";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import "@/styles/theory-content.css";

const TheoryEditorPage = () => {
  useContentProtection();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exerciseId = searchParams.get("exercise");
  
  const { data: exercises, isLoading } = useEduExercises();
  const updateExercise = useUpdateEduExercise();
  const { toast } = useToast();
  
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (exercises && exerciseId) {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        setCurrentExercise(exercise);
        setContent(exercise.content || "");
      }
    }
  }, [exercises, exerciseId]);

  const characterCount = useMemo(() => {
    if (typeof document === 'undefined') {
      return content.replace(/<[^>]*>?/gm, '').length;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return (tempDiv.textContent || tempDiv.innerText || "").length;
  }, [content]);

  const handleSave = async () => {
    if (!currentExercise) return;
    
    setIsSaving(true);
    try {
      await updateExercise.mutateAsync({
        exerciseId: currentExercise.id,
        content: content,
      });
      
      setLastSaved(new Date());
      toast({
        title: "Đã lưu thành công",
        description: "Nội dung lý thuyết đã được cập nhật.",
      });
    } catch (error) {
      toast({
        title: "Lỗi lưu nội dung",
        description: "Không thể lưu nội dung. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Không tìm thấy bài tập này. Vui lòng thử lại.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Chỉnh sửa Lý thuyết
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {currentExercise.title}
                  </Badge>
                  {lastSaved && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Lưu lần cuối: {formatTime(lastSaved)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu nội dung"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Exercise Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Tên bài tập:</span>
                  <p className="mt-1 font-medium">{currentExercise.title}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Mô tả:</span>
                  <p className="mt-1">{currentExercise.description || "Không có mô tả"}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Độ dài nội dung:</span>
                  <p className="mt-1 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {characterCount} ký tự
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rich Text Editor */}
          <WYSIWYGEditor
            value={content}
            onChange={setContent}
            placeholder="Viết nội dung bài học với định dạng đẹp mắt..."
          />
          
          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">
              {lastSaved ? (
                <span>Lưu lần cuối: {lastSaved.toLocaleString("vi-VN")}</span>
              ) : (
                <span>Chưa lưu thay đổi</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu nội dung"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheoryEditorPage;