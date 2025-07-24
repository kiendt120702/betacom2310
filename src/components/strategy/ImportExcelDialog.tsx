
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: { strategy: string; implementation: string }) => Promise<any>;
}

export function ImportExcelDialog({ open, onOpenChange, onImport }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV",
          variant: "destructive"
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để import",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Lỗi",
          description: "File không có dữ liệu",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const strategy = (row as any)['Chiến lược'] || (row as any)['strategy'] || '';
          const implementation = (row as any)['Cách thực hiện'] || (row as any)['implementation'] || '';

          if (strategy && implementation) {
            await onImport({ strategy, implementation });
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: "Hoàn thành",
        description: `Import thành công ${successCount} chiến lược${errorCount > 0 ? `, ${errorCount} lỗi` : ''}`
      });

      onOpenChange(false);
      setFile(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi import file",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { 'Chiến lược': 'Ví dụ: Tối ưu hóa SEO', 'Cách thực hiện': 'Ví dụ: Nghiên cứu từ khóa, tạo nội dung chất lượng' },
      { 'Chiến lược': '', 'Cách thực hiện': '' }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Strategies');
    XLSX.writeFile(wb, 'strategy_template.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import chiến lược từ Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Chọn file Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </div>
          
          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Hướng dẫn:</strong>
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• File Excel cần có 2 cột: "Chiến lược" và "Cách thực hiện"</li>
              <li>• Hỗ trợ format: .xlsx, .xls, .csv</li>
              <li>• Dữ liệu bắt đầu từ dòng 2 (dòng 1 là header)</li>
            </ul>
          </div>

          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Tải template mẫu
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={loading || !file}>
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Đang import...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
