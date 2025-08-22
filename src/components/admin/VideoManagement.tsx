import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video } from "lucide-react";

const VideoManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Quản lý Video
        </CardTitle>
        <CardDescription>
          Quản lý tất cả video đào tạo trong hệ thống.
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

export default VideoManagement;