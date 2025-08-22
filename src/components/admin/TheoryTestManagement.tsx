import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

const TheoryTestManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quản lý Bài tập lý thuyết
        </CardTitle>
        <CardDescription>
          Quản lý tất cả các bài test lý thuyết trong hệ thống.
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

export default TheoryTestManagement;