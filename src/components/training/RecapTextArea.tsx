import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Send, Maximize } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RecapTextAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  hasUnsavedChanges: boolean;
  canSubmit: boolean;
  disabled?: boolean;
}

const RecapTextArea: React.FC<RecapTextAreaProps> = ({
  content,
  onContentChange,
  onSubmit,
  isSubmitting,
  hasSubmitted,
  hasUnsavedChanges,
  canSubmit,
  disabled = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(content);

  useEffect(() => {
    if (!isDialogOpen) {
      setDialogContent(content);
    }
  }, [content, isDialogOpen]);

  const handleDialogOpen = () => {
    setDialogContent(content);
    setIsDialogOpen(true);
  };

  const handleDialogSave = () => {
    onContentChange(dialogContent);
    setIsDialogOpen(false);
    setTimeout(() => {
      onSubmit();
    }, 100);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onContentChange(newValue);
  }, [onContentChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  }, [canSubmit, onSubmit]);

  const buttonText = useMemo(() => {
    if (isSubmitting) return "Đang lưu...";
    if (hasSubmitted && !hasUnsavedChanges) return "Cập nhật recap";
    return "Gửi recap";
  }, [isSubmitting, hasSubmitted, hasUnsavedChanges]);

  const isButtonDisabled = useMemo(() => {
    return disabled || !content.trim() || isSubmitting || (!hasUnsavedChanges && hasSubmitted);
  }, [disabled, content, isSubmitting, hasUnsavedChanges, hasSubmitted]);

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 md:h-5 md:w-5" />
              Recap
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasSubmitted && (
                <Badge variant="default" className="bg-green-600 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đã nộp
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDialogOpen}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                value={content || ''}
                onChange={handleChange}
                placeholder="Điền recap ở đây"
                disabled={disabled}
                rows={6}
                className="min-h-[120px] md:min-h-[150px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
                data-testid="recap-textarea"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-xs text-orange-600 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-600" />
                    Có thay đổi chưa lưu
                  </span>
                )}
                {!content.trim() && !disabled && (
                  <span className="text-xs text-muted-foreground">
                    Bạn có thể ghi chú trong khi xem video
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isButtonDisabled}
                size="sm"
                className="w-full sm:w-auto min-w-[120px] transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Đang lưu...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {buttonText}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Chỉnh sửa Recap
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Soạn thảo nội dung recap của bạn trong không gian rộng rãi
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-muted/20 rounded-lg border border-border/30 p-4 h-full">
              <Textarea
                value={dialogContent}
                onChange={(e) => setDialogContent(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 text-base leading-7 p-0 bg-transparent placeholder:text-muted-foreground/50"
                placeholder="Viết recap của bạn ở đây...

• Ghi chú những điểm quan trọng từ video
• Những kiến thức mới học được  
• Suy nghĩ và câu hỏi cá nhân
• Kết nối với kiến thức đã học trước đó
• Ứng dụng thực tế của bài học"
              />
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {dialogContent.trim().length > 0 && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{dialogContent.trim().length} ký tự</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} className="px-4">
                  Hủy
                </Button>
                <Button 
                  size="sm"
                  onClick={handleDialogSave} 
                  disabled={isSubmitting || !dialogContent.trim()}
                  className="px-4"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Đang lưu...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Lưu và Gửi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecapTextArea;