import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, FileText, BarChart2 } from "lucide-react";
import { TopPage, TopUserByViews } from "@/hooks/useWebsiteAnalytics";

interface TopPagesUsersTableProps {
  topPages: TopPage[];
  topUsers: TopUserByViews[];
  isLoading: boolean;
}

const TopPagesUsersTable: React.FC<TopPagesUsersTableProps> = ({ topPages, topUsers, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Top Truy cập
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Top Truy cập
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Pages */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" /> Top Trang
                    </div>
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>Đường dẫn</TableHead>
                  <TableHead className="text-right">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.length > 0 ? (
                  topPages.map((page) => (
                    <TableRow key={page.path}>
                      <TableCell className="font-medium truncate max-w-xs">{page.path}</TableCell>
                      <TableCell className="text-right">{page.view_count.toLocaleString('vi-VN')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Top Users */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" /> Top Người dùng
                    </div>
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>Tên người dùng</TableHead>
                  <TableHead className="text-right">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.length > 0 ? (
                  topUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.user_name}</TableCell>
                      <TableCell className="text-right">{user.view_count.toLocaleString('vi-VN')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPagesUsersTable;