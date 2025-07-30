"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ShopeeFeesPage: React.FC = () => {
  const feesData = [
    { 
        type: "Chi phí cố định", 
        rate: "1,47% - 11,78%", 
        description: "Tùy từng ngành hàng." 
    },
    { 
        type: "Chi phí thanh toán", 
        rate: "4,91%", 
        description: "Áp dụng cho tất cả các đơn hàng thành công." 
    },
    { 
        type: "Thuế", 
        rate: "1,5%", 
        description: "Thuế giá trị gia tăng (VAT) theo quy định của nhà nước." 
    },
    { 
        type: "Phí hạ tầng", 
        rate: "3.000 đ", 
        description: "Áp dụng cho mỗi đơn hàng giao thành công hoặc đơn hàng có yêu cầu Trả hàng/Hoàn tiền được Người bán/Shopee chấp nhận 'Hoàn tiền ngay' (trừ lý do Chưa nhận được hàng).",
        isNew: true
    },
    { 
        type: "Voucher Xtra", 
        rate: "3%", 
        description: "Tối đa 50.000đ/sp. Miễn phí đối với các sản phẩm từ Livestream và Video nếu như tham gia." 
    },
    { 
        type: "Content Xtra", 
        rate: "2,95%", 
        description: "Shopee Mall: tối đa 50.000đ/sp tham gia livestream hoặc video. Shop thường: 3% giá trị sản phẩm." 
    },
    { 
        type: "Dịch vụ hỗ trợ phí VC", 
        rate: "5,89%", 
        description: "Chỉ dành cho Shopee Mall. Tối đa 50.000đ/sp." 
    },
    { 
        type: "Piship", 
        rate: "1.620 đ", 
        description: "Tính trên mỗi đơn hàng bàn giao cho đơn vị vận chuyển." 
    },
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
                <TableHead className="w-[250px]">Loại Phí</TableHead>
                <TableHead className="w-[150px]">Tỷ Lệ/Mức Phí</TableHead>
                <TableHead>Mô Tả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesData.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {fee.type}
                    {fee.isNew && <Badge variant="destructive" className="ml-2">NEW</Badge>}
                  </TableCell>
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