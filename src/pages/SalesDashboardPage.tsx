import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SalesDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Dashboard Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bảng điều khiển doanh số của Shopee đã được gỡ khỏi hệ thống.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboardPage;
