import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useShopeeStrategies } from '@/hooks/useShopeeStrategies';
import { TablesInsert } from '@/integrations/supabase/types';
// import { cn } from '@/lib/utils'; // Removed cn import

interface ImportShopeeStrategyDialogProps {
  onImportSuccess: () => void;
}

interface RawStrategyItem {
  'Mục tiêu chiến lược': string;
  'Cách thực hiện': string;
}

type ShopeeStrategyInsertData = Omit<TablesInsert<'shopee_strategies'>, 'id' | 'created_at' | 'updated_at'>;

const ImportShopeeStrategyDialog: React.FC<ImportShopeeStrategyDialogProps> = ({ onImportSuccess }) => {
  const { toast } = useToast();
  const { bulkCreateStrategies } = useShopeeStrategies();

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
          title: "Lỗi định dạng file",
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
          title: "Lỗi định dạng file",
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
        title: "Thiếu file",
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

        const processedStrategies: ShopeeStrategyInsertData[] = [];

        for (const row of json) {
          const objective = row['Mục tiêu chiến lược']?.trim();
          const implementation = row['Cách thực hiện']?.trim();

          if (!objective || !implementation) {
            console.warn(`Bỏ qua hàng thiếu dữ liệu: Mục tiêu: ${objective}, Cách thực hiện: ${implementation}`);
            continue;
          }

          processedStrategies.push({
            objective,
            implementation,
          });
        }

        if (processedStrategies.length === 0) {
          toast({
            title: "Không có dữ liệu hợp lệ",
            description: "File Excel không chứa dữ liệu hợp lệ để import.",
            variant: "default",
          });
          return;
        }

        await bulkCreateStrategies.mutateAsync(processedStrategies);
        
        onImportSuccess();
        setOpen(false);
        setSelectedFile(null);

      } catch (error: any) {
        console.error('Bulk import error:', error);
        toast({
          title: "Lỗi import",
          description: error.message || "Có lỗi xảy ra khi import file Excel. Vui lòng kiểm tra định dạng file và các cột 'Mục tiêu chiến lược', 'Cách thực hiện'.",
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
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-card hover:bg-accent text-foreground border-border shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3">
          <Upload className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] bg-card border border-border shadow-lg">
        <DialogHeader className="pb-6 border-b border-border">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            Import Chiến lược từ Excel
          </DialogTitle>
        </DialogHeader>
        
        <CardContent className="p-0 space-y-6">
          {/* Instructions */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Hướng dẫn định dạng file Excel
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• File phải có 2 cột: <strong>"Mục tiêu chiến lược"</strong> và <strong>"Cách thực hiện"</strong></li>
              <li>• Hàng đầu tiên là tiêu đề cột</li>
              <li>• Chỉ chấp nhận file .xlsx hoặc .xls</li>
              <li>• Không được để trống các ô dữ liệu quan trọng</li>
            </ul>
          </div>

          {/* File Upload Area */}
          <form onSubmit={(e) => { e.preventDefault(); handleBulkImport(); }} className="space-y-6">
            <div
              className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                dragActive 
                  ? 'border-primary/50 bg-primary/10' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/10'
              } ${isProcessing || bulkCreateStrategies.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing || bulkCreateStrategies.isPending ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Đang xử lý dữ liệu...</p>
                  <p className="text-xs text-muted-foreground">Vui lòng đợi trong giây lát</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-1">
                    Kéo thả file Excel vào đây
                  </p>
                  <p className="text-sm text-muted-foreground">
                    hoặc <span className="text-primary font-medium">click để chọn file</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Chỉ chấp nhận file .xlsx, .xls</p>
                </div>
              )}
            </div>

            <input
              id="excel-upload"
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing || bulkCreateStrategies.isPending}
              className="hidden"
            />

            {selectedFile && (
              <div className="flex items-center justify-between bg-muted/50 border border-border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">Sẵn sàng để import</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isProcessing || bulkCreateStrategies.isPending}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  handleRemoveFile();
                }}
                disabled={isProcessing || bulkCreateStrategies.isPending}
                className="px-6 py-2 border-border hover:bg-accent text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !selectedFile || bulkCreateStrategies.isPending}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isProcessing || bulkCreateStrategies.isPending ? (
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

export default ImportShopeeStrategyDialog;