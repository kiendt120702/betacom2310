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
      displayRate: "1,47% - 11,78%",
    },
    {
      type: "Chi phí thanh toán",
      displayRate: "4,91%",
    },
    {
      type: "Thuế",
      displayRate: "1,5%",
    },
    {
      type: "Phí hạ tầng",
      displayRate: "3.000 đ ",
    },
    {
      type: "Voucher Xtra (Tối đa 50.000đ/sp)",
      displayRate: "3%",
    },
    {
      type: "Content Xtra",
      displayRate: "2,95%",
    },
    {
      type: "Dịch vụ hỗ trợ phí Vận chuyển (Shopee Mall)",
      displayRate: "5,89%",
    },
    {
      type: "Piship",
      displayRate: "1.620 đ",
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
                  <TableCell className="whitespace-pre-wrap">
                    {fee.displayRate}
                  </TableCell>
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
