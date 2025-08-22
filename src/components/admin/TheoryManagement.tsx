import React, { useState } from "react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookText, Edit, CheckCircle, X, FileText, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingExercise } from "@/types/training";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TheoryEditDialogProps {
  exercise: TrainingExercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TheoryEditDialog: React.FC<TheoryEditDialogProps> = ({ exercise, open, onOpenChange, onSuccess }) => {
  const [content, setContent] = useState(exercise.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('edu_knowledge_exercises')
        .update({ content })
        .eq('id', exercise.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Nội dung lý thuyết đã được cập nhật",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating theory content:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật nội dung lý thuyết",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookText className="w-5 h-5" />
            Chỉnh sửa Lý thuyết: {exercise.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Nội dung lý thuyết</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung lý thuyết cho bài học này..."
              className="min-h-[300px] mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Hỗ trợ HTML: &lt;h1-h6&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;img&gt;, &lt;code&gt;, &lt;pre&gt;
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TheoryManagement: React.FC = () => {
  const { data: exercises, isLoading, refetch } = useEduExercises();
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditTheory = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setSelectedExercise(null);
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  const sortedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Quản lý Lý thuyết</h2>
        <p className="text-muted-foreground">
          Quản lý nội dung lý thuyết cho từng bài tập. Nội dung này sẽ được hiển thị trong phần "Lý thuyết" của mỗi bài học.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="w-5 h-5" />
            Danh sách Lý thuyết
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedExercises.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Tên bài tập</TableHead>
                    <TableHead>Trạng thái lý thuyết</TableHead>
                    <TableHead>Độ dài nội dung</TableHead>
                    <TableHead className="w-32 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExercises.map((exercise, index) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{exercise.title}</div>
                        {exercise.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {exercise.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {exercise.content && exercise.content.trim() ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã có nội dung
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Chưa có nội dung
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {exercise.content ? (
                          <span className="text-sm text-muted-foreground">
                            {exercise.content.length} ký tự
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTheory(exercise)}
                            className="h-8 w-8 p-0"
                            title="Chỉnh sửa lý thuyết"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có bài tập nào để quản lý lý thuyết</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedExercise && (
        <TheoryEditDialog
          exercise={selectedExercise}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default TheoryManagement;