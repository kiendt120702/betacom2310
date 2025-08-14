
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useShops } from "@/hooks/useShops";
import { useCreateShopRevenue } from "@/hooks/useShopRevenue";
import * as XLSX from 'xlsx';

export const RevenueUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [revenueDate, setRevenueDate] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const { data: shops } = useShops();
  const createRevenue = useCreateShopRevenue();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Lỗi định dạng file",
          description: "Vui lòng chọn file Excel (.xlsx)",
          variant: "destructive"
        });
      }
    }
  };

  const parseExcelFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Tìm sheet "Đơn đã xác nhận"
          const sheetName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes('đơn đã xác nhận') || 
            name.toLowerCase().includes('don da xac nhan')
          );
          
          if (!sheetName) {
            reject(new Error('Không tìm thấy sheet "Đơn đã xác nhận" trong file Excel'));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "A1:Z2" });
          
          if (jsonData.length < 2) {
            reject(new Error('File Excel không có đủ dữ liệu (cần ít nhất 2 dòng)'));
            return;
          }

          resolve({
            headers: jsonData[0] as string[],
            data: jsonData[1] as (string | number)[]
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsBinaryString(file);
    });
  };

  const extractRevenueData = (headers: string[], data: (string | number)[]) => {
    // Tìm các cột cần thiết dựa trên header
    const findColumnIndex = (keywords: string[]) => {
      return headers.findIndex(header => 
        keywords.some(keyword => 
          header.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    };

    const totalRevenueIndex = findColumnIndex(['doanh thu', 'revenue', 'tổng doanh thu']);
    const totalOrdersIndex = findColumnIndex(['đơn hàng', 'orders', 'số đơn']);
    const revenueBeforeDiscountIndex = findColumnIndex(['trước giảm giá', 'before discount']);
    const commissionIndex = findColumnIndex(['hoa hồng', 'commission']);
    const commissionOrdersIndex = findColumnIndex(['đơn hoa hồng', 'commission orders']);
    const conversionRateIndex = findColumnIndex(['tỷ lệ chuyển đổi', 'conversion rate']);
    const clickThroughOrdersIndex = findColumnIndex(['click through', 'ctc orders']);

    if (totalRevenueIndex === -1 || totalOrdersIndex === -1) {
      throw new Error('Không tìm thấy cột doanh thu hoặc số đơn hàng trong file Excel');
    }

    return {
      total_revenue: Number(data[totalRevenueIndex]) || 0,
      total_orders: Number(data[totalOrdersIndex]) || 0,
      revenue_before_discount: Number(data[revenueBeforeDiscountIndex]) || 0,
      shopee_commission: Number(data[commissionIndex]) || 0,
      commission_orders: Number(data[commissionOrdersIndex]) || 0,
      conversion_rate: Number(data[conversionRateIndex]) || 0,
      click_through_orders: Number(data[clickThroughOrdersIndex]) || 0,
    };
  };

  const handleUpload = async () => {
    if (!file || !selectedShop || !revenueDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn file, shop và ngày doanh số",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { headers, data } = await parseExcelFile(file);
      const revenueData = extractRevenueData(headers, data);

      await createRevenue.mutateAsync({
        shop_id: selectedShop,
        revenue_date: revenueDate,
        uploaded_by: null, // Will be set by RLS
        ...revenueData
      });

      // Reset form
      setFile(null);
      setSelectedShop("");
      setRevenueDate("");
      
      // Reset file input
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast({
        title: "Lỗi xử lý file",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Doanh Số Shop
        </CardTitle>
        <CardDescription>
          Tải lên file Excel doanh số từ sheet "Đơn đã xác nhận" (chỉ lấy dữ liệu dòng 1 và 2)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shop-select">Chọn Shop</Label>
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn shop..." />
            </SelectTrigger>
            <SelectContent>
              {shops?.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="revenue-date">Ngày Doanh Số</Label>
          <Input
            id="revenue-date"
            type="date"
            value={revenueDate}
            onChange={(e) => setRevenueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excel-file">File Excel</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Đã chọn: {file.name}
            </p>
          )}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || !selectedShop || !revenueDate || isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Đang xử lý..." : "Tải Lên Doanh Số"}
        </Button>
      </CardContent>
    </Card>
  );
};
