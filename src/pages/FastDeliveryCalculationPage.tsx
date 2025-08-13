import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Loader2, Calculator, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

interface OrderData {
  "Mã đơn hàng": string;
  "Ngày đặt hàng": string | number; // Can be string (formatted) or number (Excel date)
  "Ngày gửi hàng": string | number; // Can be string (formatted) or number (Excel date)
  "Trạng Thái Đơn Hàng": string;
  "Loại đơn hàng": string;
  "Đơn Vị Vận Chuyển"?: string; // Add optional shipping unit
  [key: string]: any; // Allow other properties
}

interface FHRResult {
  totalEligibleOrders: number;
  fastDeliveryOrders: number;
  fhrPercentage: number;
  excludedOrders: { reason: string; count: number }[];
  processedOrders: OrderData[];
}

const FastDeliveryCalculationPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fhrResult, setFhrResult] = useState<FHRResult | null>(null);
  const { toast } = useToast();

  // Filter states
  const [orderCodeFilter, setOrderCodeFilter] = useState("");
  const debouncedOrderCodeFilter = useDebounce(orderCodeFilter, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [shippingUnitFilter, setShippingUnitFilter] = useState("all"); // New filter state

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
        setFhrResult(null);
        return;
      }
      setFile(selectedFile);
      setFhrResult(null);
      // Reset filters when a new file is selected
      setOrderCodeFilter("");
      setStatusFilter("all");
      setTypeFilter("all");
      setShippingUnitFilter("all"); // Reset new filter
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
    setFhrResult(null);

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

        // Perform FHR calculation with deduplicated data
        const result = calculateFHR(deduplicatedOrders);
        setFhrResult(result);
        toast({
          title: "Thành công",
          description: "Đã xử lý file Excel và tính toán FHR.",
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

  const calculateFHR = (orders: OrderData[]): FHRResult => {
    let totalEligibleOrders = 0;
    let fastDeliveryOrders = 0;
    const excludedOrders: { reason: string; count: number }[] = [];
    const processedOrders: OrderData[] = [];

    const addExcludedReason = (reason: string) => {
      const existing = excludedOrders.find(e => e.reason === reason);
      if (existing) {
        existing.count++;
      } else {
        excludedOrders.push({ reason, count: 1 });
      }
    };

    // Get the date 30 days ago from the most recent Monday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysSinceMonday = (dayOfWeek + 6) % 7; // Days since last Monday (0 for Monday, 1 for Tuesday...)
    const lastMonday = new Date(today.setDate(today.getDate() - daysSinceMonday));
    lastMonday.setHours(0, 0, 0, 0); // Start of the day

    const thirtyDaysAgo = new Date(lastMonday);
    thirtyDaysAgo.setDate(lastMonday.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of the day

    orders.forEach(order => {
      const orderDate = new Date(order["Ngày đặt hàng"]);
      orderDate.setHours(0, 0, 0, 0); // Normalize to start of day

      // 1. Filter orders within the last 30 days from the most recent Monday
      if (orderDate < thirtyDaysAgo || orderDate > lastMonday) {
        addExcludedReason("Ngoài 30 ngày tính từ Thứ Hai gần nhất");
        return;
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

      totalEligibleOrders++;
      processedOrders.push(order);

      const shipDate = new Date(order["Ngày gửi hàng"]);
      const orderHour = new Date(order["Ngày đặt hàng"]).getHours();

      let deliveryDeadline = new Date(order["Ngày đặt hàng"]);
      deliveryDeadline.setHours(23, 59, 59, 999); // Default to 23:59 same day

      // Adjust deadline based on order time
      if (orderHour >= 18) {
        deliveryDeadline.setDate(deliveryDeadline.getDate() + 1); // Next day
        deliveryDeadline.setHours(11, 59, 59, 999); // 11:59 next day
      }

      // Adjust deadline for Sunday/Holiday (simplified: assumes only Sunday is a fixed non-working day)
      // For a full holiday calendar, this would need external data.
      if (deliveryDeadline.getDay() === 0) { // If deadline falls on a Sunday
        deliveryDeadline.setDate(deliveryDeadline.getDate() + 1); // Move to Monday
        deliveryDeadline.setHours(11, 59, 59, 999); // 11:59 Monday
      }
      // This simplified logic doesn't account for actual public holidays.

      if (shipDate <= deliveryDeadline) {
        fastDeliveryOrders++;
      }
    });

    const fhrPercentage = totalEligibleOrders > 0 ? (fastDeliveryOrders / totalEligibleOrders) * 100 : 0;

    return {
      totalEligibleOrders,
      fastDeliveryOrders,
      fhrPercentage: parseFloat(fhrPercentage.toFixed(2)),
      excludedOrders,
      processedOrders,
    };
  };

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    if (!fhrResult) return [];

    let currentFiltered = fhrResult.processedOrders;

    // Apply order code filter
    if (debouncedOrderCodeFilter) {
      currentFiltered = currentFiltered.filter(order =>
        String(order["Mã đơn hàng"]).toLowerCase().includes(debouncedOrderCodeFilter.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter(order =>
        String(order["Trạng Thái Đơn Hàng"]).toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      currentFiltered = currentFiltered.filter(order =>
        String(order["Loại đơn hàng"]).toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Apply shipping unit filter
    if (shippingUnitFilter !== "all") {
      const excludeInstant = "siêu tốc - 4 giờ-spx instant";
      currentFiltered = currentFiltered.filter(order => {
        const shippingUnit = String(order["Đơn Vị Vận Chuyển"] || "").toLowerCase();
        // If a specific unit is selected, only show that unit AND exclude the instant type
        return shippingUnit === shippingUnitFilter.toLowerCase() && shippingUnit !== excludeInstant;
      });
    } else {
      // If "all" is selected, still exclude "Siêu Tốc - 4 Giờ-SPX Instant"
      currentFiltered = currentFiltered.filter(order => {
        const shippingUnit = String(order["Đơn Vị Vận Chuyển"] || "").toLowerCase();
        return shippingUnit !== "siêu tốc - 4 giờ-spx instant";
      });
    }

    return currentFiltered;
  }, [fhrResult, debouncedOrderCodeFilter, statusFilter, typeFilter, shippingUnitFilter]);

  // Extract unique statuses and types for select options
  const uniqueStatuses = useMemo(() => {
    if (!fhrResult) return [];
    const statuses = new Set<string>();
    fhrResult.processedOrders.forEach(order => {
      if (order["Trạng Thái Đơn Hàng"]) {
        statuses.add(String(order["Trạng Thái Đơn Hàng"]));
      }
    });
    return Array.from(statuses);
  }, [fhrResult]);

  const uniqueTypes = useMemo(() => {
    if (!fhrResult) return [];
    const types = new Set<string>();
    fhrResult.processedOrders.forEach(order => {
      if (order["Loại đơn hàng"]) {
        types.add(String(order["Loại đơn hàng"]));
      }
    });
    return Array.from(types);
  }, [fhrResult]);

  const uniqueShippingUnits = useMemo(() => {
    if (!fhrResult) return [];
    const units = new Set<string>();
    fhrResult.processedOrders.forEach(order => {
      if (order["Đơn Vị Vận Chuyển"]) {
        units.add(String(order["Đơn Vị Vận Chuyển"]));
      }
    });
    return Array.from(units);
  }, [fhrResult]);

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
              Tính Tỷ lệ giao hàng nhanh (FHR)
            </h1>
            <p className="text-muted-foreground">
              Tải lên file Excel để tính toán FHR của bạn
            </p>
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
            <br />
            <span className="text-sm text-muted-foreground">
              Đảm bảo file có các cột: "Mã đơn hàng", "Ngày đặt hàng", "Ngày gửi hàng", "Trạng Thái Đơn Hàng", "Loại đơn hàng", "Đơn Vị Vận Chuyển".
            </span>
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

      {fhrResult && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-500" />
              Dữ liệu đơn hàng đã xử lý
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Lọc theo Mã đơn hàng..."
                  value={orderCodeFilter}
                  onChange={(e) => setOrderCodeFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Lọc theo Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Trạng thái</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Lọc theo Loại đơn hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Loại đơn hàng</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={shippingUnitFilter} onValueChange={setShippingUnitFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Lọc theo Đơn vị vận chuyển" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Đơn vị vận chuyển</SelectItem>
                  {uniqueShippingUnits.map(unit => (
                    <SelectItem key={unit} value={unit.toLowerCase()}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fhrResult.processedOrders.length > 0 && Object.keys(fhrResult.processedOrders[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((row, rowIndex) => (
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
                      <TableCell colSpan={Object.keys(fhrResult.processedOrders[0] || {}).length} className="text-center py-4 text-muted-foreground">
                        Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
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