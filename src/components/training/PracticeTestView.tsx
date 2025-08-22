import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

const PracticeTestView: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Kiểm tra thực hành
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Nội dung kiểm tra thực hành sẽ được cập nhật sớm.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeTestView;