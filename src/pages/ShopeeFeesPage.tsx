"use client";

import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border">
          <div className="flex items-center gap-3 mb-4">
            {/* Removed DollarSign icon */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Phí Sàn Shopee
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Áp dụng từ ngày 1/8/2025
            </Badge>
          </div>
        </div>

        {/* Fees Table */}
        <Card className="shadow-sm"> {/* Removed border class */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      Loại Phí
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Tỷ Lệ/Mức Phí
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feesData.map((fee, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {fee.type}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">
                          {fee.displayRate}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShopeeFeesPage;