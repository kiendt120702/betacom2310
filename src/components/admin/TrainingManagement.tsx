
import React, { useState } from "react";
import { useTrainingCourses } from "@/hooks/useTrainingCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Video, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
            Quản lý các khóa học và nội dung đào tạo
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo khóa học mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Khóa học
                </Badge>
              </div>
              {course.description && (
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Số lần học tối thiểu:</span>
                  <span className="font-medium">{course.min_study_sessions}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Video ôn tập:</span>
                  <span className="font-medium">{course.min_review_videos}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                    className="flex-1 gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageVideos(course)}
                    className="flex-1 gap-1"
                  >
                    <Video className="w-3 h-3" />
                    Video
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có khóa học nào</h3>
          <p className="text-muted-foreground mb-4">
            Tạo khóa học đầu tiên để bắt đầu
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo khóa học mới
          </Button>
        </div>
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
