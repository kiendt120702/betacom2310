"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Removed Badge import as it's no longer needed for 'NEW'

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
        description: "Áp dụng cho mỗi đơn hàng giao thành công hoặc đơn hàng có yêu cầu Trả hàng/Hoàn tiền được Người bán/Shopee chấp nhận 'Hoàn tiền ngay' (trừ lý do Chưa nhận được hàng)."
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
          <p className="text-sm text-muted-foreground">Áp dụng từ ngày 1/8</p>
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
                  </TableCell>
                  <TableCell>{fee.rate}</TableCell>
                  <TableCell>
                    {fee.type === "Phí hạ tầng" ? (
                      <>
                        Áp dụng cho mỗi đơn hàng giao thành công hoặc đơn hàng có yêu cầu Trả hàng/Hoàn tiền được Người bán/Shopee chấp nhận 'Hoàn tiền ngay'<br />(trừ lý do Chưa nhận được hàng).
                      </>
                    ) : fee.type === "Voucher Xtra" ? (
                      <>
                        Tối đa 50.000đ/sp.<br />Miễn phí đối với các sản phẩm từ Livestream và Video nếu như tham gia.
                      </>
                    ) : fee.type === "Content Xtra" ? (
                      <>
                        Shopee Mall: tối đa 50.000đ/sp tham gia livestream hoặc video.<br />Shop thường: 3% giá trị sản phẩm.
                      </>
                    ) : fee.type === "Dịch vụ hỗ trợ phí VC" ? (
                      <>
                        <span className="text-red-500">Chỉ dành cho Shopee Mall</span>.<br />Tối đa 50.000đ/sp.
                      </>
                    ) : (
                      fee.description
                    )}
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