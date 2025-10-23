import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TiktokComprehensiveReportsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>TikTok Reports Disabled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Các báo cáo tổng hợp TikTok đã được gỡ bỏ khỏi hệ thống.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TiktokComprehensiveReportsPage;
