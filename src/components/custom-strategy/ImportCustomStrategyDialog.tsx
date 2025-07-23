import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStrategyIndustries } from '@/hooks/useStrategyIndustries';
import { useCustomStrategies, CustomStrategy } from '@/hooks/useCustomStrategies';
import { TablesInsert } from '@/integrations/supabase/types';

interface ImportCustomStrategyDialogProps {
  onImportSuccess: () => void;
}

interface RawStrategyItem {
  'Mục tiêu chiến lược': string;
  'Cách thực hiện': string;
  'Ngành hàng áp dụng'?: string;
}

type CustomStrategyInsertData = Omit<TablesInsert<'custom_strategies'>, 'id' | 'created_at' | 'updated_at'>;

const ImportCustomStrategyDialog: React.FC<ImportCustomStrategyDialogProps> = ({ onImportSuccess }) => {
  const { toast } = useToast();
  const { industries, isLoading: isLoadingIndustries } = useStrategyIndustries();
  const { createStrategy } = useCustomStrategies(); // Use createStrategy for single inserts, or a new bulk hook

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn một file Excel (.xlsx hoặc .xls) hợp lệ.",
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn một file Excel (.xlsx hoặc .xls) hợp lệ.",
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Excel để import.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: RawStrategyItem[] = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          throw new Error("File Excel không chứa dữ liệu hoặc định dạng không đúng.");
        }

        const processedStrategies: CustomStrategyInsertData[] = [];
        const industryMap = new Map(industries.map(ind => [ind.name.toLowerCase(), ind.id]));

        for (const row of json) {
          const objective = row['Mục tiêu chiến lược']?.trim();
          const implementation = row['Cách thực hiện']?.trim();
          const industryName = row['Ngành hàng áp dụng']?.trim();

          if (!objective || !implementation) {
            console.warn(`Bỏ qua hàng thiếu dữ liệu: Mục tiêu: ${objective}, Cách thực hiện: ${implementation}`);
            continue;
          }

          let industry_id: string | null = null;
          if (industryName) {
            industry_id = industryMap.get(industryName.toLowerCase()) || null;
            if (!industry_id) {
              toast({
                title: "Cảnh báo",
                description: `Ngành hàng "${industryName}" không tồn tại. Chiến lược "${objective}" sẽ được thêm mà không có ngành hàng.`,
                variant: "default",
              });
            }
          }

          processedStrategies.push({
            objective,
            implementation,
            industry_id,
          });
        }

        if (processedStrategies.length === 0) {
          toast({
            title: "Thông báo",
            description: "File Excel không chứa dữ liệu hợp lệ để import.",
            variant: "default",
          });
          return;
        }

        // Using a loop for individual mutations to leverage existing toast/error handling
        // For very large files, a single bulk insert mutation would be more efficient
        let successCount = 0;
        let failCount = 0;
        for (const strategy of processedStrategies) {
          try {
            await createStrategy.mutateAsync(strategy);
            successCount++;
          } catch (error) {
            failCount++;
            console.error("Failed to import strategy:", strategy, error);
          }
        }

        if (successCount > 0) {
          toast({
            title: "Import thành công!",
            description: `Đã thêm ${successCount} chiến lược tùy chỉnh vào hệ thống.`,
          });
          onImportSuccess();
          setOpen(false);
          setSelectedFile(null);
        } else {
          toast({
            title: "Lỗi",
            description: `Không có chiến lược nào được thêm thành công. Tổng số lỗi: ${failCount}.`,
            variant: "destructive",
          });
        }

      } catch (error: any) {
        console.error('Bulk import error:', error);
        toast({
          title: "Lỗi",
          description: error.message || "Có lỗi xảy ra khi import file Excel. Vui lòng kiểm tra định dạng file và các cột 'Mục tiêu chiến lược', 'Cách thực hiện', 'Ngành hàng áp dụng'.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger> {/* Removed asChild */}
        <Button variant="outline" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary">
          <Upload className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Import Chiến lược từ file Excel
          </DialogTitle>
        </DialogHeader>
        <CardContent className="p-0">
          <form onSubmit={(e) => { e.preventDefault(); handleBulkImport(); }} className="space-y-4">
            <div
              className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-primary/50 bg-primary/10' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing || isLoadingIndustries ? (
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Đang xử lý dữ liệu...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Kéo thả file Excel vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-500">Chỉ chấp nhận file .xlsx, .xls</p>
                </div>
              )}
            </div>

            <input
              id="excel-upload"
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing || isLoadingIndustries}
              className="hidden"
            />

            {selectedFile && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  handleRemoveFile();
                }}
                disabled={isProcessing}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !selectedFile}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import dữ liệu
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCustomStrategyDialog;