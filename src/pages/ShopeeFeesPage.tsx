"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ShopeeFeesPage: React.FC = () => {
  const feesData = [
    { type: "Phí cố định", rate: "2.5%", description: "Áp dụng cho tất cả sản phẩm" },
    { type: "Phí thanh toán", rate: "2.0%", description: "Áp dụng cho tất cả sản phẩm" },
    { type: "Phí dịch vụ", rate: "5.0%", description: "Áp dụng cho các dịch vụ đặc biệt" },
    { type: "Phí vận chuyển", rate: "Theo đơn vị vận chuyển", description: "Tùy thuộc vào trọng lượng và khoảng cách" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Phí Sàn Shopee</h1>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết về các loại phí trên Shopee</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Loại Phí</TableHead>
                <TableHead>Tỷ Lệ/Mức Phí</TableHead>
                <TableHead>Mô Tả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesData.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{fee.type}</TableCell>
                  <TableCell>{fee.rate}</TableCell>
                  <TableCell>{fee.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-muted-foreground">
            Lưu ý: Các mức phí trên có thể thay đổi theo chính sách của Shopee. Vui lòng kiểm tra thông tin mới nhất trên trang chủ Shopee.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopeeFeesPage;