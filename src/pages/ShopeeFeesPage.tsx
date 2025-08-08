"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
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
      displayRate: "3.000 đ",
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
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
          📊 Phí Sàn Shopee
        </h1>
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            Áp dụng từ ngày 1/8/2025
          </Badge>
        </div>
      </div>

      {/* Main Table */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 px-6 text-left">
                    Loại Phí
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 px-6 text-right">
                    Tỷ Lệ/Mức Phí
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feesData.map((fee, index) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4 px-6">
                      {fee.type}
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        {fee.displayRate}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ShopeeFeesPage;
