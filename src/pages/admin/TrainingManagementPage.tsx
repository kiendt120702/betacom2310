
import React, { useState } from 'react';
import { useTrainingCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '@/hooks/useTrainingCourses';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { TrainingCourse, CreateCourseData } from '@/hooks/useTrainingCourses';

const TrainingManagementPage = () => {
  const { data: courses, isLoading, error } = useTrainingCourses();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);

  const [formData, setFormData] = useState<CreateCourseData>({
    title: '',
    description: '',
    min_study_sessions: 1,
    min_review_videos: 0,
  });

  const handleInputChange = (field: keyof CreateCourseData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      min_study_sessions: 1,
      min_review_videos: 0,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourseMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    
    try {
      await updateCourseMutation.mutateAsync({
        id: editingCourse.id,
        ...formData,
      });
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await deleteCourseMutation.mutateAsync(courseId);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const openEditDialog = (course: TrainingCourse) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      min_study_sessions: course.min_study_sessions,
      min_review_videos: course.min_review_videos,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý khóa học đào tạo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500">
              Có lỗi xảy ra khi tải dữ liệu: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quản lý khóa học đào tạo</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khóa học
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo khóa học mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Tên khóa học</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_study_sessions">Số lần học tối thiểu</Label>
                      <Input
                        id="min_study_sessions"
                        type="number"
                        min="1"
                        value={formData.min_study_sessions}
                        onChange={(e) => handleInputChange('min_study_sessions', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_review_videos">Số lần video ôn tập</Label>
                      <Input
                        id="min_review_videos"
                        type="number"
                        min="0"
                        value={formData.min_review_videos}
                        onChange={(e) => handleInputChange('min_review_videos', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={createCourseMutation.isPending}>
                      {createCourseMutation.isPending ? 'Đang tạo...' : 'Tạo khóa học'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung đào tạo</TableHead>
                <TableHead className="text-center">Số lần học tối thiểu</TableHead>
                <TableHead className="text-center">Số lần video ôn tập</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.title}</div>
                      {course.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {course.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                      {course.min_study_sessions}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 text-secondary-foreground font-medium">
                      {course.min_review_videos}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {new Date(course.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(course.id)}
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

          {(!courses || courses.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có khóa học đào tạo nào được tạo.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Tên khóa học</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-min_study_sessions">Số lần học tối thiểu</Label>
                <Input
                  id="edit-min_study_sessions"
                  type="number"
                  min="1"
                  value={formData.min_study_sessions}
                  onChange={(e) => handleInputChange('min_study_sessions', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-min_review_videos">Số lần video ôn tập</Label>
                <Input
                  id="edit-min_review_videos"
                  type="number"
                  min="0"
                  value={formData.min_review_videos}
                  onChange={(e) => handleInputChange('min_review_videos', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCourse(null);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateCourseMutation.isPending}>
                {updateCourseMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingManagementPage;
