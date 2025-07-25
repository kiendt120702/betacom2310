
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { secureLog, validateFile, sanitizeInput, createRateLimiter } from '@/lib/utils';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: { strategy: string; implementation: string }) => Promise<void>;
}

// Create rate limiter for import operations (max 5 imports per minute)
const importRateLimiter = createRateLimiter(5, 60 * 1000);

export const ImportExcelDialog: React.FC<ImportExcelDialogProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    secureLog('File selected for import', { fileName: selectedFile.name, fileSize: selectedFile.size });

    // Enhanced file validation
    const validation = validateFile(selectedFile, {
      maxSize: 5 * 1024 * 1024, // 5MB limit for Excel files
      allowedTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ],
      allowedExtensions: ['xlsx', 'xls', 'csv']
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      secureLog('File validation failed:', { errors: validation.errors });
      return;
    }

    // Check for suspicious file content
    if (await containsSuspiciousContent(selectedFile)) {
      setValidationErrors(['File chứa nội dung nghi ngờ và không thể import']);
      secureLog('Suspicious content detected in Excel file');
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    
    // Generate preview
    try {
      const preview = await generatePreview(selectedFile);
      setPreviewData(preview);
    } catch (error) {
      secureLog('Preview generation error:', { error });
      setValidationErrors(['Không thể đọc file. Vui lòng kiểm tra định dạng file.']);
    }
  };

  const containsSuspiciousContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          resolve(false);
          return;
        }
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
          /=\s*CMD\s*\(/i,
          /=\s*EXEC\s*\(/i,
          /=\s*SYSTEM\s*\(/i,
          /javascript:/i,
          /<script/i,
          /vbscript:/i,
          /=\s*HYPERLINK\s*\(/i, // Suspicious hyperlinks
          /=\s*WEBSERVICE\s*\(/i, // External web calls
        ];
        
        const containsSuspicious = suspiciousPatterns.some(pattern => 
          pattern.test(content)
        );
        
        resolve(containsSuspicious);
      };
      
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  const generatePreview = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            raw: false
          });
          
          // Take first 5 rows for preview
          const preview = jsonData.slice(0, 5);
          resolve(preview);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) return;

    // Check rate limit
    const userId = 'current-user'; // In real app, get from auth context
    if (!importRateLimiter(userId)) {
      toast({
        title: "Lỗi",
        description: "Quá nhiều lần import. Vui lòng thử lại sau 1 phút.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    secureLog('Starting Excel import process');

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            raw: false
          });

          // Enhanced data validation and sanitization
          const validData = validateAndSanitizeData(jsonData);
          
          if (validData.length === 0) {
            throw new Error('Không tìm thấy dữ liệu hợp lệ trong file');
          }

          secureLog('Processing Excel data', { rowCount: validData.length });

          let successCount = 0;
          let errorCount = 0;

          // Process data in batches to prevent overwhelming the system
          const batchSize = 10;
          for (let i = 0; i < validData.length; i += batchSize) {
            const batch = validData.slice(i, i + batchSize);
            
            await Promise.allSettled(
              batch.map(async (row) => {
                try {
                  await onImport({
                    strategy: row.strategy,
                    implementation: row.implementation,
                  });
                  successCount++;
                } catch (error) {
                  errorCount++;
                  secureLog('Import row error:', { error });
                }
              })
            );
          }

          secureLog('Import completed', { successCount, errorCount });

          toast({
            title: "Hoàn thành",
            description: `Import thành công ${successCount} dòng${errorCount > 0 ? `, ${errorCount} dòng lỗi` : ''}`,
            variant: successCount > 0 ? "default" : "destructive",
          });

          if (successCount > 0) {
            onOpenChange(false);
            setFile(null);
            setPreviewData([]);
          }

        } catch (error: any) {
          secureLog('Import processing error:', { error: error.message });
          toast({
            title: "Lỗi",
            description: error.message || "Có lỗi xảy ra khi xử lý file",
            variant: "destructive",
          });
        } finally {
          setImporting(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      secureLog('Import error:', { error: error.message });
      toast({
        title: "Lỗi",
        description: "Không thể đọc file Excel",
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  const validateAndSanitizeData = (rawData: any[]): Array<{strategy: string; implementation: string}> => {
    const validData: Array<{strategy: string; implementation: string}> = [];
    
    // Skip header row and process data
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      if (!row || row.length < 2) continue;
      
      const strategy = sanitizeInput(String(row[0] || ''));
      const implementation = sanitizeInput(String(row[1] || ''));
      
      // Validate required fields
      if (!strategy.trim() || !implementation.trim()) {
        continue;
      }
      
      // Additional content validation
      if (strategy.length > 500 || implementation.length > 1000) {
        continue;
      }
      
      validData.push({ strategy, implementation });
    }
    
    return validData;
  };

  const resetDialog = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Excel File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Chọn file Excel (.xlsx, .xls, .csv)
              </p>
            </label>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Lỗi xác thực:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* File Info */}
          {file && validationErrors.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">File đã chọn:</span>
              </div>
              <p className="text-sm text-blue-700">{file.name}</p>
              <p className="text-sm text-blue-600">
                Kích thước: {Math.round(file.size / 1024)} KB
              </p>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Xem trước dữ liệu:</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Chiến lược</th>
                      <th className="text-left p-2">Cách thực hiện</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 max-w-xs truncate">{row[0]}</td>
                        <td className="p-2 max-w-xs truncate">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Hủy
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importing || validationErrors.length > 0}
            >
              {importing ? 'Đang import...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
