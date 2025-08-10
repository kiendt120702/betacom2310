
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const WorkTypeManagement: React.FC = () => {
  const workTypes = [
    { value: "fulltime", label: "Toàn thời gian", description: "Làm việc 8 tiếng/ngày, 5 ngày/tuần" },
    { value: "parttime", label: "Bán thời gian", description: "Làm việc linh hoạt theo giờ" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Hình thức làm việc</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {workTypes.map((type) => (
          <div key={type.value} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{type.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Hình thức làm việc được quản lý trong phần chỉnh sửa thông tin người dùng.
      </p>
    </div>
  );
};

export default WorkTypeManagement;
