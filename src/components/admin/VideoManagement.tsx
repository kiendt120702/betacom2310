import React, { useState } from "react";
import { useTrainingCourses, TrainingCourse, useDeleteTrainingCourse } from "@/hooks/useTrainingCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Video, Loader2 } from "lucide-react";
import ManageVideosDialog from "./ManageVideosDialog";
import CreateCourseDialog from "./CreateCourseDialog";
import EditCourseDialog from "./EditCourseDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VideoManagement: React.FC = () => {
  const { data: courses = [], isLoading } = useTrainingCourses();
  const deleteCourseMutation = useDeleteTrainingCourse();
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [isManageVideosOpen, setIsManageVideosOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

  const handleManageVideos = (course: TrainingCourse) => {
    setSelectedCourse(course);
    setIsManageVideosOpen(true);
  };

  const handleEditCourse = (course: TrainingCourse) => {
    setSelectedCourse(course);
    setIsEditCourseOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourseMutation.mutate(courseId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý Khóa học Video</h2>
        <Button onClick={() => setIsCreateCourseOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khóa học</CardTitle>
          <CardDescription>
            Mỗi khóa học chứa một hoặc nhiều video đào tạo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleManageVideos(course)}>
                          <Video className="w-4 h-4 mr-2" />
                          Quản lý Videos
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditCourse(course)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa khóa học "{course.title}"? Tất cả video trong khóa học này cũng sẽ bị xóa.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCourse(course.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <ManageVideosDialog
          open={isManageVideosOpen}
          onClose={() => setIsManageVideosOpen(false)}
          course={selectedCourse}
        />
      )}

      <CreateCourseDialog
        open={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
      />

      {selectedCourse && (
        <EditCourseDialog
          open={isEditCourseOpen}
          onClose={() => setIsEditCourseOpen(false)}
          course={selectedCourse}
        />
      )}
    </div>
  );
};

export default VideoManagement;