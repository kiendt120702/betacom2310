
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Shop } from "@/hooks/useShops";
import { useUploadSalesData } from "@/hooks/useSalesReports";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shops: Shop[];
}

const ExcelUploadDialog = ({ open, onOpenChange, shops }: ExcelUploadDialogProps) => {
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadSalesData = useUploadSalesData();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('sheet') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      }
    }
  };

  const processExcelFile = async (file: File): Promise<{ date: string; amount: number }[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Find the "Đơn đã xác nhận" sheet
          const sheetName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes('đơn đã xác nhận') || 
            name.toLowerCase().includes('don da xac nhan')
          ) || workbook.SheetNames[0];
          
          if (!sheetName) {
            reject(new Error("Không tìm thấy sheet 'Đơn đã xác nhận'"));
            return;
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Find headers row
          let headerRow = -1;
          let dateColumn = -1;
          let salesColumn = -1;
          
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            for (let j = 0; j < row.length; j++) {
              const cell = String(row[j] || '').toLowerCase();
              if (cell.includes('ngày') || cell.includes('date')) {
                headerRow = i;
                dateColumn = j;
              }
              if (cell.includes('tổng doanh số') || cell.includes('total') || cell.includes('doanh số')) {
                salesColumn = j;
              }
            }
            if (headerRow !== -1 && dateColumn !== -1 && salesColumn !== -1) break;
          }
          
          if (headerRow === -1 || dateColumn === -1 || salesColumn === -1) {
            reject(new Error("Không tìm thấy cột 'Ngày' hoặc 'Tổng doanh số (VND)' trong file Excel"));
            return;
          }
          
          const salesData: { date: string; amount: number }[] = [];
          
          // Process data rows
          for (let i = headerRow + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            const dateValue = row[dateColumn];
            const salesValue = row[salesColumn];
            
            if (!dateValue || !salesValue) continue;
            
            // Parse date
            let date: Date;
            if (typeof dateValue === 'number') {
              // Excel date number
              date = new Date((dateValue - 25569) * 86400 * 1000);
            } else {
              // String date
              date = new Date(dateValue);
            }
            
            if (isNaN(date.getTime())) continue;
            
            // Parse sales amount
            const amount = typeof salesValue === 'number' 
              ? salesValue 
              : parseFloat(String(salesValue).replace(/[^\d.-]/g, ''));
            
            if (isNaN(amount)) continue;
            
            salesData.push({
              date: date.toISOString().split('T')[0],
              amount: Math.round(amount)
            });
          }
          
          resolve(salesData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Lỗi đọc file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedShopId || !selectedMonth || !selectedYear || !file) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn file");
      return;
    }

    setIsProcessing(true);
    try {
      const salesData = await processExcelFile(file);
      
      if (salesData.length === 0) {
        toast.error("Không tìm thấy dữ liệu doanh số trong file");
        return;
      }

      await uploadSalesData.mutateAsync({
        shopId: selectedShopId,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        dailySalesData: salesData
      });

      // Reset form
      setSelectedShopId("");
      setSelectedMonth("");
      setSelectedYear("");
      setFile(null);
      onOpenChange(false);
      
      toast.success(`Đã upload thành công ${salesData.length} bản ghi doanh số`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Có lỗi xảy ra khi xử lý file Excel");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Upload doanh số từ Excel
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-select">Shop</Label>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month-select">Tháng</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year-select">Năm</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">File Excel</Label>
            <Input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Chọn file Excel có sheet "Đơn đã xác nhận" với cột "Ngày" và "Tổng doanh số (VND)"
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isProcessing || uploadSalesData.isPending}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? "Đang xử lý..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelUploadDialog;
