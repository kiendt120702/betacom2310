import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

const OrganizationalChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sơ đồ tổ chức công ty
        </CardTitle>
        <CardDescription>
          Đây là cấu trúc tổ chức hiện tại của Betacom.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Sơ đồ tổ chức sẽ được xây dựng ở đây.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationalChart;