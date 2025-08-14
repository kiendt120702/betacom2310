
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoanhSoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DoanhSoImportDialog: React.FC<DoanhSoImportDialogProps> = ({
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
      
      if (!allowedTypes.includes(selectedFile.type) && 
          !selectedFile.name.toLowerCase().endsWith('.xlsx') && 
          !selectedFile.name.toLowerCase().endsWith('.xls')) {
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
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to edge function
      const { data, error } = await supabase.functions.invoke('upload-comprehensive-reports-excel', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thành công",
        description: data.message || `Đã import thành công ${data.imported_count} bản ghi`,
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
            Import Dữ Liệu Doanh Số
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              File Excel phải có sheet tên "Đơn đã xác nhận" với đầy đủ các cột dữ liệu theo đúng thứ tự.
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
            <h4 className="font-medium mb-2">Thứ tự cột trong sheet "Đơn đã xác nhận":</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Ngày</li>
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

export default DoanhSoImportDialog;
