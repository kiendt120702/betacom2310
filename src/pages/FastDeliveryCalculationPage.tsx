import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Loader2, Calculator, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderData {
  "Mã đơn hàng": string;
  "Ngày đặt hàng": string | number; // Can be string (formatted) or number (Excel date)
  "Ngày gửi hàng": string | number; // Can be string (formatted) or number (Excel date)
  "Trạng Thái Đơn Hàng": string;
  "Loại đơn hàng": string;
  "Đơn Vị Vận Chuyển"?: string; // Add optional shipping unit
  "Thời gian đơn hàng được thanh toán"?: string | number; // Add payment time
  [key: string]: any; // Allow other properties
}

interface ProcessedResult {
  filteredOrders: OrderData[];
  excludedOrdersSummary: { reason: string; count: number }[];
}

const FastDeliveryCalculationPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file Excel (.xlsx hoặc .xls).",
          variant: "destructive",
        });
        setFile(null);
        setProcessedData(null);
        return;
      }
      setFile(selectedFile);
      setProcessedData(null);
    }
  };

  const processExcelFile = async () => {
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một file Excel.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProcessedData(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true }); // cellDates to parse dates
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Use raw: false to get formatted values (including dates)
        let json: OrderData[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        if (!json || json.length === 0) {
          toast({
            title: "Lỗi",
            description: "File Excel không chứa dữ liệu hoặc định dạng không đúng.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // --- Xử lý loại bỏ trùng lặp ---
        const uniqueOrdersMap = new Map<string, OrderData>();
        json.forEach(order => {
          if (order["Mã đơn hàng"]) {
            uniqueOrdersMap.set(order["Mã đơn hàng"], order);
          }
        });
        const deduplicatedOrders = Array.from(uniqueOrdersMap.values());
        // --- Kết thúc phần xử lý loại bỏ trùng lặp ---

        // Process and filter orders
        const result = processAndFilterOrders(deduplicatedOrders);
        setProcessedData(result);
        toast({
          title: "Thành công",
          description: "Đã xử lý và lọc dữ liệu đơn hàng.",
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đọc file Excel. Vui lòng kiểm tra định dạng.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processAndFilterOrders = (orders: OrderData[]): ProcessedResult => {
    const excludedOrdersSummary: { reason: string; count: number }[] = [];
    const filteredOrders: OrderData[] = [];

    const addExcludedReason = (reason: string) => {
      const existing = excludedOrdersSummary.find(e => e.reason === reason);
      if (existing) {
        existing.count++;
      } else {
        excludedOrdersSummary.push({ reason, count: 1 });
      }
    };

    orders.forEach(order => {
      const shippingUnit = String(order["Đơn Vị Vận Chuyển"] || "").toLowerCase();
      const instantShippingUnits = [
        "siêu tốc - 4 giờ-spx instant",
        "siêu tốc - 4 giờ-bedelivery",
        "siêu tốc - 4 giờ-ahamove"
      ];

      // Exclude instant delivery units immediately
      if (instantShippingUnits.includes(shippingUnit)) {
        addExcludedReason(`Đơn vị vận chuyển: ${order["Đơn Vị Vận Chuyển"]}`);
        return; // Skip this order
      }

      // 2. Exclude specific order types/statuses
      const orderStatus = order["Trạng Thái Đơn Hàng"]?.toLowerCase();
      const orderType = order["Loại đơn hàng"]?.toLowerCase();

      if (orderType === "hàng đặt trước") {
        addExcludedReason("Hàng đặt trước");
        return;
      }
      if (orderType === "đơn người bán tự vận chuyển") {
        addExcludedReason("Đơn Người bán tự vận chuyển");
        return;
      }
      if (orderStatus === "đã hủy") {
        addExcludedReason("Đơn bị hủy");
        return;
      }
      if (orderStatus === "thanh toán không thành công") {
        addExcludedReason("Đơn thanh toán không thành công");
        return;
      }

      // 3. Filter to ONLY INCLUDE orders where "Thời gian đơn hàng được thanh toán" is after 18:00
      if (order["Thời gian đơn hàng được thanh toán"]) {
        try {
          const paymentDate = new Date(order["Thời gian đơn hàng được thanh toán"]);
          if (paymentDate.getHours() < 18) { // Check if hour is BEFORE 18:00
            addExcludedReason("Thời gian thanh toán trước 18:00");
            return; // Exclude the order
          }
          // If hour is >= 18, it passes the check and continues
        } catch (e) {
          console.warn("Could not parse payment date for order:", order["Mã đơn hàng"], e);
          addExcludedReason("Không thể đọc thời gian thanh toán");
          return; // Exclude if date is invalid
        }
      } else {
        // If there's no payment time, exclude it.
        addExcludedReason("Không có thông tin thời gian thanh toán");
        return;
      }

      filteredOrders.push(order);
    });

    return {
      filteredOrders,
      excludedOrdersSummary,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Lọc dữ liệu đơn hàng Shopee
            </h1>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Tải lên file Excel
          </CardTitle>
          <CardDescription>
            Vui lòng tải lên file Excel chứa dữ liệu đơn hàng của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={processExcelFile} disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Xử lý File
                </>
              )}
            </Button>
          </div>
          {file && (
            <p className="text-sm text-muted-foreground">
              File đã chọn: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {processedData && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-500" />
              Kết quả lọc đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {processedData.filteredOrders.length > 0 && Object.keys(processedData.filteredOrders[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.filteredOrders.length > 0 ? (
                    processedData.filteredOrders.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <TableCell key={colIndex} className="whitespace-nowrap">
                            {value instanceof Date ? format(value, "dd/MM/yyyy HH:mm", { locale: vi }) : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={Object.keys(processedData.filteredOrders[0] || {}).length} className="text-center py-4 text-muted-foreground">
                        Không tìm thấy đơn hàng nào đủ điều kiện sau khi lọc.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FastDeliveryCalculationPage;