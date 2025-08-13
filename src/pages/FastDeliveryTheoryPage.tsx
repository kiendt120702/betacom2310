import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Info } from "lucide-react";
import { cn } from "@/lib/utils"; // For styling

const FastDeliveryTheoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tỷ lệ giao hàng nhanh trên Shopee
            </h1>
            <p className="text-muted-foreground">
              Quy định và cách tính tỷ lệ giao hàng nhanh (FHR)
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            A. Quy định về Tỷ lệ giao hàng nhanh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Tỷ lệ giao hàng nhanh (FHR) là gì?</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                Tỷ lệ giao hàng nhanh là phần trăm "Số đơn hàng được bàn giao cho đơn vị vận chuyển (DVVC) trước một hạn bàn giao nhất định" trên "Tổng số đơn phát sinh trong 30 ngày gần nhất tính từ thứ Hai hàng tuần".
              </li>
              <li>
                Từ ngày 16/06/2025, Shopee cập nhật Hạn bàn giao để đơn hàng được tính là "Giao hàng nhanh" như sau:
              </li>
            </ul>

            {/* Table recreated from Image 1 */}
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Thời gian đơn phát sinh trong ngày</TableHead>
                    <TableHead className="font-semibold text-center">Trước ngày 16/06/2025</TableHead>
                    <TableHead className="font-semibold text-center">Từ ngày 16/06/2025</TableHead>
                  </TableRow>
                  <TableRow className="bg-blue-100 text-blue-800 font-medium">
                    <TableCell colSpan={3} className="text-center">
                      Hạn bàn giao cho DVVC để đơn hàng được tính là "Giao hàng nhanh"
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Từ 0:00 đến 17:59</TableCell>
                    <TableCell className="text-center">Trước 23:59 cùng ngày</TableCell>
                    <TableCell className="text-center">Trước 23:59 cùng ngày</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Từ 18:00 đến 23:59</TableCell>
                    <TableCell className="text-center">Trước 23:59 ngày kế tiếp</TableCell>
                    <TableCell className="text-center font-bold text-red-600">Trước 11:59 ngày kế tiếp</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* FHR Formula Image */}
            <div className="text-center mt-6">
              <img
                src="/images/fast-delivery/fhr-formula.png" // Path to saved image
                alt="Công thức tính Tỷ lệ giao hàng nhanh (FHR)"
                className="max-w-full h-auto mx-auto rounded-lg shadow-md border"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Công thức tính Tỷ lệ giao hàng nhanh
              </p>
            </div>
          </div>

          {/* Lưu ý Section from Image 2 */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-orange-600">
              <Info className="h-5 w-5" />
              Lưu ý:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                Người bán cần <span className="font-bold text-red-600">nhấn chuẩn bị hàng trước 9H sáng</span> để đơn hàng được phân bổ đơn vị vận chuyển kịp thời và có thể bàn giao trước 11:59.
              </li>
              <li>
                Hàng đặt trước, Đơn Người bán tự vận chuyển, Đơn bị hủy và Đơn thanh toán không thành công sẽ không bị tính vào Tỷ lệ giao hàng nhanh.
              </li>
              <li>
                Hạn bàn giao để đơn hàng được tính là "Giao hàng nhanh" nếu rơi vào ngày Chủ nhật hoặc ngày lễ sẽ được chuyển sang trước 11:59 ngày thứ Hai hoặc ngày làm việc kế tiếp.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FastDeliveryTheoryPage;