
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface StrategyExcelImportProps {
  onImport: (strategies: { strategy: string; implementation: string }[]) => void;
  isLoading?: boolean;
}

const StrategyExcelImport: React.FC<StrategyExcelImportProps> = ({
  onImport,
  isLoading = false
}) => {
  const [open, setOpen] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const strategies = jsonData.slice(1).map((row: any) => ({
          strategy: row[0] || '',
          implementation: row[1] || ''
        })).filter(item => item.strategy.trim() && item.implementation.trim());

        if (strategies.length === 0) {
          toast({
            title: "Lỗi",
            description: "File Excel không có dữ liệu hợp lệ",
            variant: "destructive",
          });
          return;
        }

        onImport(strategies);
        setOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Lỗi",
          description: "Không thể đọc file Excel",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Chiến lược', 'Cách thực hiện'],
      ['Tối ưu hóa từ khóa', 'Nghiên cứu từ khóa phù hợp với sản phẩm và tối ưu hóa tiêu đề'],
      ['Chăm sóc khách hàng', 'Trả lời tin nhắn khách hàng nhanh chóng và chuyên nghiệp']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Strategies');
    XLSX.writeFile(workbook, 'strategy_template.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import chiến lược từ Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">Chọn file Excel</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>File Excel cần có 2 cột:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Cột A: Chiến lược</li>
              <li>Cột B: Cách thực hiện</li>
            </ul>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Tải template
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyExcelImport;
