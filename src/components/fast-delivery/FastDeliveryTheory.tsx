import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Info } from "lucide-react";
import { cn } from "@/lib/utils"; // For styling

const FastDeliveryTheory: React.FC = () => {
  return (
    <div className="space-y-6">

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
            <div className="overflow-x-auto rounded-md border mx-auto"> {/* Removed max-w-md to allow it to expand */}
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
                className="max-w-xl h-auto mx-auto rounded-lg shadow-md border"
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

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">2. Quy định về Tỷ lệ giao hàng nhanh</h3>
            <p className="text-muted-foreground">Người bán cần đạt Tỷ lệ giao hàng nhanh:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="font-bold">Từ 80% trở lên:</span>
                <ul className="list-circle list-inside ml-4">
                  <li>Để được xét duyệt Shop Yêu Thích; hoặc</li>
                  <li>Để duy trì nhãn Shopee Mall (Người bán không thuộc ngành hàng Sách & Tạp chí); hoặc</li>
                  <li>Không bị tạm khóa tài khoản (Người bán thuộc ngành hàng Sách & Tạp chí).</li>
                </ul>
              </li>
              <li>
                <span className="font-bold">Từ 85% trở lên:</span> Để được xét duyệt Shop Yêu Thích+.
              </li>
            </ul>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">3. Minh họa các tình huống giao hàng nhanh</h3>
            <div className="text-center mt-6">
              <img
                src="/images/fast-delivery/fhr-scenarios.png" // Path to saved image
                alt="3 tình huống về Tỷ lệ giao hàng nhanh"
                className="max-w-md h-auto mx-auto rounded-lg shadow-md border"
              />
              <p className="text-sm text-muted-foreground mt-2">
                3 tình huống về Tỷ lệ giao hàng nhanh thường gặp và sau thời hạn xử lý trên Shopee
              </p>
            </div>
            {/* New content added here */}
            <div className="space-y-2 text-muted-foreground">
              <p className="font-bold flex items-center gap-1">
                <span role="img" aria-label="pointing finger">👉</span> Dựa vào 3 tình huống trên, thời hạn giao hàng nhanh sẽ được gia hạn tương ứng nếu:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Tình huống 2: Đơn phát sinh từ 18H trở đi của ngày mà ngày kế là ngày lễ/ngày nghỉ;</li>
                <li>Tình huống 3: Đơn phát sinh trong ngày lễ/ngày nghỉ.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">4. Đơn phát sinh trong ngày Thứ Ba, và nghỉ lễ từ thứ Tư đến hết thứ Bảy</h3>
            <p className="text-muted-foreground">
              Nếu đơn phát sinh trong ngày Thứ Ba, và nghỉ lễ từ thứ Tư đến hết thứ Bảy, thì Người bán cần bàn giao cho DVVC vào thứ mấy để đơn hàng được tính là "Giao hàng nhanh"?
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Đối với đơn phát sinh trước 18:00, Người bán cần bàn giao cho DVVC trước 23:59 Thứ Ba.</li>
              <li>Đối với đơn phát sinh từ 18:00 trở đi, Người bán cần bàn giao cho DVVC trước 11:59 trưa Thứ Hai tuần sau.</li>
            </ul>
            <div className="text-center mt-6">
              <img
                src="/images/fast-delivery/fhr-holiday-scenario.png" // Path to saved image
                alt="Minh họa đơn phát sinh trước lễ"
                className="max-w-lg h-auto mx-auto rounded-lg shadow-md border"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Minh họa đơn phát sinh trước lễ.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FastDeliveryTheory;