
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { sanitizeInput, validateFileType, validateFileSize, validateFileContent, secureLog, createRateLimiter } from '@/lib/utils';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: { strategy: string; implementation: string }) => Promise<any>;
}

// Create rate limiter for file uploads (5 files per minute)
const uploadRateLimiter = createRateLimiter(5, 60000);

export function ImportExcelDialog({ open, onOpenChange, onImport }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setValidationWarnings([]);
    
    // Check rate limiting
    if (!uploadRateLimiter('file-upload')) {
      toast({
        title: "Lỗi",
        description: "Bạn đang tải file quá nhanh. Vui lòng chờ một chút.",
        variant: "destructive"
      });
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    // Enhanced file validation
    if (!validateFileType(selectedFile, validTypes)) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV",
        variant: "destructive"
      });
      return;
    }

    if (!validateFileSize(selectedFile, 10)) { // 10MB limit
      toast({
        title: "Lỗi",
        description: "File không được vượt quá 10MB",
        variant: "destructive"
      });
      return;
    }

    // Content validation
    const isContentSafe = await validateFileContent(selectedFile);
    if (!isContentSafe) {
      toast({
        title: "Lỗi bảo mật",
        description: "File chứa nội dung không an toàn",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    secureLog('File selected for import', { 
      name: selectedFile.name, 
      size: selectedFile.size,
      type: selectedFile.type 
    });
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

      // Limit number of rows to prevent abuse
      if (jsonData.length > 1000) {
        toast({
          title: "Lỗi",
          description: "File chứa quá nhiều dòng (tối đa 1000 dòng)",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const warnings: string[] = [];

      for (const row of jsonData) {
        try {
          const rawStrategy = (row as any)['Chiến lược'] || (row as any)['strategy'] || '';
          const rawImplementation = (row as any)['Cách thực hiện'] || (row as any)['implementation'] || '';

          // Sanitize inputs
          const strategy = sanitizeInput(rawStrategy);
          const implementation = sanitizeInput(rawImplementation);

          if (strategy && implementation) {
            // Additional validation
            if (strategy.length > 500) {
              warnings.push(`Chiến lược quá dài (${strategy.substring(0, 50)}...)`);
              continue;
            }
            if (implementation.length > 2000) {
              warnings.push(`Cách thực hiện quá dài (${implementation.substring(0, 50)}...)`);
              continue;
            }

            await onImport({ strategy, implementation });
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          secureLog('Error importing row:', error);
        }
      }

      if (warnings.length > 0) {
        setValidationWarnings(warnings);
      }

      toast({
        title: "Hoàn thành",
        description: `Import thành công ${successCount} chiến lược${errorCount > 0 ? `, ${errorCount} lỗi` : ''}${warnings.length > 0 ? `, ${warnings.length} cảnh báo` : ''}`
      });

      if (errorCount === 0 && warnings.length === 0) {
        onOpenChange(false);
        setFile(null);
      }
    } catch (error) {
      secureLog('Import error:', error);
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

          {validationWarnings.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Cảnh báo:</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
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
              <li>• Tối đa 1000 dòng và file không quá 10MB</li>
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
