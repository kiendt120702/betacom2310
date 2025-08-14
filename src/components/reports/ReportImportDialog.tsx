
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from 'xlsx';

interface ReportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ReportImportDialog: React.FC<ReportImportDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.toLowerCase().endsWith('.xlsx') && !selectedFile.name.toLowerCase().endsWith('.xls')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Read file as array buffer
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: 'array' });

      // Find "Đơn đã xác nhận" sheet
      const sheetName = 'Đơn đã xác nhận';
      if (!workbook.Sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" không tìm thấy trong file Excel`);
      }

      // Convert sheet to JSON
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      console.log('Sheet names available:', Object.keys(workbook.Sheets));
      console.log('Data length:', data.length);
      console.log('First 3 rows:', data.slice(0, 3));

      if (data.length < 1) {
        throw new Error('Sheet không có dữ liệu');
      }

      // Process data (skip header row if exists)
      const reports = [];
      const startRow = data[0] && typeof data[0][0] === 'string' && 
                       (data[0][0].toLowerCase().includes('ngày') || 
                        data[0][0].toLowerCase().includes('date') ||
                        data[0][0].toLowerCase().includes('thời gian')) ? 1 : 0;
      
      const rows = data.slice(startRow);
      console.log('Processing rows from index:', startRow);
      console.log('Rows to process:', rows.length);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[0]) continue; // Skip empty rows
        
        console.log(`Processing row ${i + startRow}:`, row.slice(0, 5));

        // Parse date with better handling
        let reportDate = null;
        const dateValue = row[0];
        
        if (typeof dateValue === 'string') {
          const dateStr = dateValue.trim();
          
          // Handle time-prefixed dates like "00:00 12-08-2025"
          const timeMatch = dateStr.match(/^\d{2}:\d{2}\s+(.+)$/);
          const actualDateStr = timeMatch ? timeMatch[1] : dateStr;
          
          // Try parsing DD-MM-YYYY format
          const ddmmyyyy = actualDateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
          if (ddmmyyyy) {
            const [, day, month, year] = ddmmyyyy;
            reportDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            // Try other date formats
            const parsedDate = new Date(actualDateStr);
            if (!isNaN(parsedDate.getTime())) {
              reportDate = parsedDate.toISOString().split('T')[0];
            }
          }
        } else if (typeof dateValue === 'number') {
          // Excel date number
          const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
          reportDate = excelDate.toISOString().split('T')[0];
        }

        if (!reportDate) {
          console.log('Skipping row with invalid date:', dateValue);
          continue;
        }

        console.log('Parsed date:', reportDate);

        // Parse numeric values
        const parseNumber = (value: any) => {
          if (value === null || value === undefined || value === '') return 0;
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            // Remove dots used as thousand separators and replace comma with dot for decimals
            const cleaned = value.replace(/\./g, '').replace(',', '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
          }
          return 0;
        };

        const parseInt = (value: any) => {
          const num = parseNumber(value);
          return Math.floor(num);
        };

        const report = {
          report_date: reportDate,
          total_revenue: parseNumber(row[1]),
          total_orders: parseInt(row[2]),
          average_order_value: parseNumber(row[3]),
          product_clicks: parseInt(row[4]),
          total_visits: parseInt(row[5]),
          conversion_rate: parseNumber(row[6]) / 100, // Convert percentage to decimal
          cancelled_orders: parseInt(row[7]),
          cancelled_revenue: parseNumber(row[8]),
          returned_orders: parseInt(row[9]),
          returned_revenue: parseNumber(row[10]),
          total_buyers: parseInt(row[11]),
          new_buyers: parseInt(row[12]),
          existing_buyers: parseInt(row[13]),
          potential_buyers: parseInt(row[14]),
          buyer_return_rate: parseNumber(row[15]) / 100, // Convert percentage to decimal
        };

        console.log('Created report:', report);
        reports.push(report);
      }

      console.log('Total reports created:', reports.length);

      if (reports.length === 0) {
        throw new Error('Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra format dữ liệu.');
      }

      // Check if comprehensive_reports table exists by trying a simple select
      console.log('Checking if comprehensive_reports table exists...');
      const { data: tableCheck, error: tableError } = await supabase
        .from('comprehensive_reports')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('Table check error:', tableError);
        
        if (tableError.message.includes('does not exist')) {
          throw new Error('Bảng comprehensive_reports chưa được tạo. Vui lòng liên hệ admin để tạo bảng.');
        } else {
          throw new Error(`Lỗi kiểm tra bảng: ${tableError.message}`);
        }
      }

      console.log('Table exists, inserting data...');

      // Insert data into database using upsert
      const { error: insertError } = await supabase
        .from('comprehensive_reports')
        .upsert(reports, {
          onConflict: 'report_date',
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Lỗi khi lưu dữ liệu: ${insertError.message}`);
      }

      toast({
        title: "Thành công",
        description: `Đã import thành công ${reports.length} bản ghi`,
      });

      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể import file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Báo Cáo Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vui lòng đảm bảo file Excel của bạn có sheet tên "Đơn đã xác nhận" với các cột dữ liệu đúng thứ tự.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="excel-file">Chọn file Excel</Label>
            <Input
              ref={fileInputRef}
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Đã chọn: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <h4 className="font-medium mb-2">Thứ tự cột trong Excel:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Ngày (hoặc Thời gian)</li>
              <li>Tổng doanh số (VND)</li>
              <li>Tổng số đơn hàng</li>
              <li>Doanh số trung bình trên mỗi đơn hàng</li>
              <li>Số lượt nhấp vào sản phẩm</li>
              <li>Số lượt truy cập</li>
              <li>Tỷ lệ chuyển đổi đơn hàng (%)</li>
              <li>Số đơn đã hủy</li>
              <li>Doanh số của các đơn đã hủy</li>
              <li>Số đơn đã hoàn trả / hoàn tiền</li>
              <li>Doanh số của các đơn hoàn trả / hoàn tiền</li>
              <li>Số người mua</li>
              <li>Số người mua mới</li>
              <li>Số người mua hiện tại</li>
              <li>Số người mua tiềm năng</li>
              <li>Tỷ lệ quay lại của người mua (%)</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportImportDialog;
