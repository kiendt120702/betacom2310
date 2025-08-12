
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Info } from "lucide-react";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";
import { Badge } from "@/components/ui/badge";

interface WorkType {
  id: string;
  value: string;
  label: string;
  description: string;
}

const WorkTypeManagement: React.FC = () => {
  // Work types are enum values in the database - these are fixed
  const workTypes: WorkType[] = [
    { 
      id: "1", 
      value: "fulltime", 
      label: "Full time", 
      description: "Làm việc toàn thời gian" 
    },
    { 
      id: "2", 
      value: "parttime", 
      label: "Part time", 
      description: "Làm việc bán thời gian" 
    },
  ];

  return (
    <StandardManagementLayout
      title="Quản lý hình thức làm việc"
      icon={Clock}
      isEmpty={false}
    >
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">
            Thông tin: Hình thức làm việc được định nghĩa trong hệ thống và không thể chỉnh sửa trực tiếp.
          </span>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Giá trị hệ thống</TableHead>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes.map((workType) => (
              <TableRow key={workType.id}>
                <TableCell>
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {workType.value}
                  </code>
                </TableCell>
                <TableCell className="font-medium">{workType.label}</TableCell>
                <TableCell className="text-muted-foreground">{workType.description}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Hoạt động
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </StandardManagementLayout>
  );
};

export default WorkTypeManagement;
