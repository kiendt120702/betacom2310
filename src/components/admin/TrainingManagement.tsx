
import React, { useState } from "react";
import { useTrainingCourses } from "@/hooks/useTrainingCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Video, BookOpen } from "lucide-react";
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
import ManageVideosDialog from "./ManageVideosDialog";

const TrainingManagement: React.FC = () => {
  const { data: courses, isLoading } = useTrainingCourses();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [videosDialogOpen, setVideosDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setEditDialogOpen(true);
  };

  const handleManageVideos = (course: any) => {
    setSelectedCourse(course);
    setVideosDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      toast({
        title: "Thông báo",
        description: "Tính năng xóa khóa học sẽ được triển khai",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đào tạo</h1>
          <p className="text-muted-foreground">
            Quản lý các khóa học và nội dung đào tạo theo quy trình từng bước
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
              Quy trình đào tạo
            </CardTitle>
            <CardDescription>
              Danh sách các khóa học được sắp xếp theo thứ tự học từng bài một
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
                    <TableHead className="w-32">Số lần học</TableHead>
                    <TableHead className="w-32">Video ôn tập</TableHead>
                    <TableHead className="w-32">Trạng thái</TableHead>
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
                        <Badge variant="outline" className="font-mono">
                          {course.min_study_sessions}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {course.min_review_videos}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Hoạt động
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
                            onClick={() => handleManageVideos(course)}
                            className="h-8 w-8 p-0"
                            title="Quản lý video"
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Xóa"
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
              Tạo khóa học đầu tiên để bắt đầu xây dựng quy trình đào tạo
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
        <>
          <EditCourseDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedCourse(null);
            }}
            course={selectedCourse}
          />

          <ManageVideosDialog
            open={videosDialogOpen}
            onClose={() => {
              setVideosDialogOpen(false);
              setSelectedCourse(null);
            }}
            course={selectedCourse}
          />
        </>
      )}
    </div>
  );
};

export default TrainingManagement;
