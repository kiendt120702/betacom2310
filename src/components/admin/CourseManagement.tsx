
import React, { useState } from "react";
import { useTrainingCourses, useDeleteTrainingCourse } from "@/hooks/useTrainingCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen, Users, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateCourseDialog from "./CreateCourseDialog";
import EditCourseDialog from "./EditCourseDialog";
import { TrainingCourse } from "@/hooks/useTrainingCourses";

const CourseManagement: React.FC = () => {
  const { data: courses, isLoading } = useTrainingCourses();
  const deleteCourseMutation = useDeleteTrainingCourse();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);

  const handleEditCourse = (course: TrainingCourse) => {
    setSelectedCourse(course);
    setEditDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseName}"?`)) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Khóa học</h1>
          <p className="text-muted-foreground">
            Quản lý các khóa học đào tạo cho nhân viên
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo khóa học mới
        </Button>
      </div>

      {courses && courses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Danh sách khóa học
            </CardTitle>
            <CardDescription>
              Quản lý các khóa học đào tạo được sắp xếp theo thứ tự
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Tên khóa học</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="w-32">Yêu cầu học</TableHead>
                    <TableHead className="w-32">Video ôn tập</TableHead>
                    <TableHead className="w-40 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{course.title}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="line-clamp-2 text-sm text-muted-foreground">
                          {course.description || "Chưa có mô tả"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.min_study_sessions} lần
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {course.min_review_videos} video
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="h-8 w-8 p-0"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Xóa"
                            disabled={deleteCourseMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Chưa có khóa học nào</CardTitle>
            <CardDescription className="mb-4">
              Tạo khóa học đào tạo đầu tiên để bắt đầu xây dựng chương trình học
            </CardDescription>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo khóa học mới
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateCourseDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {selectedCourse && (
        <EditCourseDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
        />
      )}
    </div>
  );
};

export default CourseManagement;
