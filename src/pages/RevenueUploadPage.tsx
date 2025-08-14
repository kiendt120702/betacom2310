import React from 'react';
import { RevenueUpload } from '@/components/revenue/RevenueUpload';
import { useShopRevenue } from '@/hooks/useShopRevenue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const RevenueUploadPage = () => {
  const { data: revenues, isLoading } = useShopRevenue();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Quản Lý Doanh Số Shop</h1>
        <p className="text-muted-foreground">
          Tải lên và quản lý dữ liệu doanh số từ file Excel
        </p>
      </div>

      <RevenueUpload />

      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Doanh Số</CardTitle>
          <CardDescription>
            Danh sách các dữ liệu doanh số đã tải lên
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Đang tải dữ liệu...</div>
          ) : revenues && revenues.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Tổng Doanh Thu</TableHead>
                    <TableHead>Số Đơn</TableHead>
                    <TableHead>Hoa Hồng Shopee</TableHead>
                    <TableHead>Tỷ Lệ Chuyển Đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenues.map((revenue) => (
                    <TableRow key={revenue.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {revenue.shops?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(revenue.revenue_date)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(revenue.revenue_amount)}
                      </TableCell>
                      <TableCell>{revenue.total_orders.toLocaleString()}</TableCell>
                      <TableCell>{revenue.shopee_commission}</TableCell>
                      <TableCell>{revenue.conversion_rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có dữ liệu doanh số nào được tải lên
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueUploadPage;