import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TiktokSalesDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>TikTok Dashboard Removed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bảng điều khiển doanh số TikTok không còn được hỗ trợ.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TiktokSalesDashboard;
