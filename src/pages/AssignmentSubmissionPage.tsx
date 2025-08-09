
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const AssignmentSubmissionPage = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nộp phần ôn tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Tính năng đang phát triển</h3>
            <p className="text-muted-foreground">
              Trang nộp bài tập sẽ được hoàn thiện trong bản cập nhật tiếp theo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentSubmissionPage;
