
import React from 'react';
import { useTrainingCourses } from '@/hooks/useTrainingCourses';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TrainingProcessPage = () => {
  const { data: courses, isLoading, error } = useTrainingCourses();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Quy trình đào tạo</CardTitle>
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
          <CardTitle>Quy trình đào tạo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung đào tạo</TableHead>
                <TableHead className="text-center">Số lần học tối thiểu</TableHead>
                <TableHead className="text-center">Số lần video ôn tập</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
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
    </div>
  );
};

export default TrainingProcessPage;
