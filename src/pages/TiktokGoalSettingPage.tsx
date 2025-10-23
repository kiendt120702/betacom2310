import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TiktokGoalSettingPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>TikTok Goal Setting Removed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chức năng thiết lập mục tiêu TikTok đã bị vô hiệu hóa vĩnh viễn.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TiktokGoalSettingPage;
