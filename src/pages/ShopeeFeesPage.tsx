"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ShopeeFeesPage: React.FC = () => {
  const feesData = [
    {
      type: "Chi phí cố định",
      displayRate: "1,47% - 11,78% (Tùy từng ngành hàng.)",
    },
    {
      type: "Chi phí thanh toán",
      displayRate: "4,91% (Áp dụng cho tất cả các đơn hàng thành công.)",
    },
    {
      type: "Thuế",
      displayRate: "1,5% (Thuế giá trị gia tăng (VAT) theo quy định của nhà nước.)",
    },
    {
      type: "Phí hạ tầng",
      displayRate: "3.000 đ (Áp dụng cho mỗi đơn hàng giao thành công hoặc đơn hàng có yêu cầu Trả hàng/Hoàn tiền được Người bán/Shopee chấp nhận 'Hoàn tiền ngay' (trừ lý do Chưa nhận được hàng).)",
    },
    {
      type: "Voucher Xtra",
      displayRate: "3% (Tối đa 50.000đ/sp. Miễn phí đối với các sản phẩm từ Livestream và Video nếu như tham gia.)",
    },
    {
      type: "Content Xtra",
      displayRate: "2,95% (Shopee Mall: tối đa 50.000đ/sp tham gia livestream hoặc video. Shop thường: 3% giá trị sản phẩm.)",
    },
    {
      type: "Dịch vụ hỗ trợ phí VC",
      displayRate: "5,89% (Chỉ dành cho Shopee Mall. Tối đa 50.000đ/sp.)",
    },
    {
      type: "Piship",
      displayRate: "1.620 đ (Tính trên mỗi đơn hàng bàn giao cho đơn vị vận chuyển.)",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Phí Sàn Shopee</h1>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết về các loại phí trên Shopee</CardTitle>
          <p className="text-lg text-red-500">Áp dụng từ ngày 1/8</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Loại Phí</TableHead>
                <TableHead className="w-[400px]">Tỷ Lệ/Mức Phí</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesData.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{fee.type}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{fee.displayRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopeeFeesPage;