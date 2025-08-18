import React from "react";
import OrganizationalChart from "@/components/OrganizationalChart";
import { BookText } from "lucide-react";

const WikiPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookText className="h-8 w-8 text-primary" />
          Wiki Công Ty
        </h1>
        <p className="text-muted-foreground mt-2">
          Nơi lưu trữ tài liệu nội bộ và sơ đồ tổ chức.
        </p>
      </div>
      <OrganizationalChart />
    </div>
  );
};

export default WikiPage;