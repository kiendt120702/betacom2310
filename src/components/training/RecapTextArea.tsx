
import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Send } from 'lucide-react';

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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
            Recap
          </CardTitle>
          {hasSubmitted && (
            <Badge variant="default" className="bg-green-600 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đã nộp
            </Badge>
          )}
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
  );
};

export default RecapTextArea;
