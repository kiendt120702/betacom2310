import React, { useState } from "react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookText, Edit, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingExercise } from "@/types/training";
import { useNavigate } from "react-router-dom";


const TheoryManagement: React.FC = () => {
  const { data: exercises, isLoading } = useEduExercises();
  const navigate = useNavigate();

  const handleEditTheory = (exercise: TrainingExercise) => {
    const url = `/theory-editor?exercise=${exercise.id}`;
    navigate(url);
  };

  const getTextLength = (htmlContent: string | null): number => {
    if (!htmlContent) return 0;
    if (typeof document === 'undefined') {
      // Fallback for SSR or non-browser environments
      return htmlContent.replace(/<[^>]*>?/gm, '').length;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return (tempDiv.textContent || tempDiv.innerText || "").length;
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
                            {getTextLength(exercise.content)} ký tự
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTheory(exercise)}
                            className="flex items-center gap-2"
                            title="Chỉnh sửa lý thuyết"
                          >
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
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

    </div>
  );
};

export default TheoryManagement;