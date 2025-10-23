import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ThumbnailGallery: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Library Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chức năng quản lý thumbnail đã được gỡ bỏ khỏi hệ thống.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThumbnailGallery;
