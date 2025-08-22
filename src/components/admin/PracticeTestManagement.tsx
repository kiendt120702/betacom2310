import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit } from "lucide-react";

const PracticeTestManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Quản lý Bài tập thực hành
        </CardTitle>
        <CardDescription>
          Quản lý và xem lại các bài tập thực hành đã nộp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Chức năng này đang được phát triển.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeTestManagement;