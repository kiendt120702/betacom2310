import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import OrgChartNode from "./OrgChartNode";
import "./OrganizationalChart.css";
import type { OrgNode } from "./OrgChartNode";

const chartData: OrgNode = {
  title: 'BOD',
  color: 'bod',
  children: [
    {
      title: 'Ban Kiểm soát',
      color: 'control',
      children: [
        {
          title: 'Trưởng phòng Vận hành',
          name: 'Hoàng Minh Anh',
          color: 'department',
          children: [
            { title: 'Project manager', color: 'leader' },
            { 
              title: 'Leader Shopee', 
              name: '1. Bùi Thị Nga\n2. Hoàng Quốc Bình\n3. Nguyễn Phương Thanh\n4. Phạm Thị Thơm\n5. Trương Thị Quỳnh\n6. Hoàng Thị Giang', 
              color: 'leader',
              children: [{ title: 'Chuyên viên', color: 'staff' }]
            },
            { 
              title: 'Leader TikTok/Booking', 
              name: 'Trương Thị Quỳnh', 
              color: 'leader',
              children: [
                { title: 'Chuyên viên', color: 'staff' },
                { title: 'Booking', color: 'staff' }
              ]
            },
            { 
              title: 'Leader CSKH', 
              color: 'leader',
              children: [{ title: 'CSKH', color: 'staff' }]
            },
            { 
              title: 'Leader Media', 
              color: 'leader',
              children: [
                { title: 'Designer', color: 'staff' },
                { title: 'Livestreamer', color: 'staff' }
              ]
            },
          ],
        },
        {
          title: 'Trưởng phòng thương mại',
          name: 'Đào Thanh Cầm',
          color: 'department',
          children: [
            { 
              title: 'Quản lý Kho', 
              name: 'Nguyễn Hà Giang', 
              color: 'leader',
              children: [{ title: 'Nhân viên Kho', color: 'staff' }]
            }
          ],
        },
        {
          title: 'Trưởng phòng đào tạo',
          name: 'Phạm Thị Thơm',
          color: 'department',
          children: [
            { 
              title: 'Leader đào tạo', 
              name: 'Phạm Thị Thơm', 
              color: 'leader',
              children: [{ title: 'Thử việc/Học việc', color: 'staff' }]
            }
          ],
        },
        {
          title: 'Trưởng phòng kinh doanh/Marketing',
          name: 'Đào Thanh Cầm',
          color: 'department',
          children: [
            { 
              title: 'Sale Leader', 
              name: 'Nguyễn Xuân Hoàng', 
              color: 'leader',
              children: [{ title: 'Sale', color: 'staff' }]
            },
            { 
              title: 'CSKH Leader', 
              color: 'leader',
              children: [{ title: 'CSKH', color: 'staff' }]
            },
            { 
              title: 'Marketing Leader', 
              color: 'leader',
              children: [{ title: 'Marketing', color: 'staff' }]
            },
          ],
        },
        {
          title: 'Trưởng phòng Kế toán',
          color: 'department',
          children: [
            { 
              title: 'Trưởng nhóm Kế toán', 
              color: 'leader',
              children: [
                { title: 'Kế toán', name: 'Lê Thị Hậu', color: 'staff' },
                { title: 'Thủ quỹ', name: 'Lương Thị Thùy Linh', color: 'staff' }
              ]
            }
          ],
        },
        {
          title: 'Trưởng phòng nhân sự',
          color: 'department',
          children: [
            { 
              title: 'Trưởng nhóm nhân sự', 
              color: 'leader',
              children: [{ title: 'HCNS', name: 'Nguyễn Thu Trang', color: 'staff' }]
            }
          ],
        },
        {
          title: 'Trưởng phòng công nghệ',
          color: 'department',
          children: [
            { 
              title: 'IT Leader', 
              name: 'Đỗ Trung Kiên', 
              color: 'leader',
              children: [{ title: 'IT', color: 'staff' }]
            }
          ],
        },
      ],
    },
  ],
};

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
        <div className="org-chart">
          <OrgChartNode node={chartData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationalChart;