import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { useBulkCreateSeoKnowledge, SeoKnowledgeMutationInput } from '@/hooks/useSeoKnowledge';
import { Json } from '@/integrations/supabase/types';

interface RawSeoItem {
  id: string;
  content: string;
  metadata: {
    type: string;
    category: string;
    priority: string;
    product?: string;
  };
}

const processSeoData = (data: RawSeoItem[]): SeoKnowledgeMutationInput[] => {
  return data.map(item => {
    const content = item.content;
    let title = content.split('.')[0].trim(); // Try to get first sentence
    if (title.length > 50 || title.length < 5) { // If too long or too short, use first few words
      title = content.split(' ').slice(0, 10).join(' ').trim();
      if (title.length === 0) { // Fallback if content is empty or just spaces
        title = `Section ${item.id}`;
      } else if (content.length > title.length) {
        title += '...';
      }
    }

    let chunkType: string | null = null;
    if (item.metadata && typeof item.metadata.type === 'string') {
      switch (item.metadata.type) {
        case "hướng dẫn": chunkType = "guideline"; break;
        case "quy tắc": chunkType = "rule"; break;
        case "định nghĩa": chunkType = "definition"; break;
        case "ví dụ": chunkType = "example"; break;
        default: chunkType = "general"; // Fallback
      }
    }

    return {
      title: title,
      content: content,
      chunk_type: chunkType,
      section_number: String(item.id),
      word_count: content.split(' ').filter(word => word.length > 0).length,
      metadata: item.metadata as Json,
    };
  });
};

interface ImportSeoKnowledgeDialogProps {
  onImportSuccess: () => void;
}

const ImportSeoKnowledgeDialog: React.FC<ImportSeoKnowledgeDialogProps> = ({ onImportSuccess }) => {
  const { toast } = useToast();
  const bulkCreate = useBulkCreateSeoKnowledge();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn một file JSON hợp lệ.",
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
      if (file.type !== 'application/json') {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn một file JSON hợp lệ.",
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
        description: "Vui lòng chọn file JSON để import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Không thể đọc nội dung file.");
        }
        const rawData: RawSeoItem[] = JSON.parse(text);
        
        if (!Array.isArray(rawData)) {
          throw new Error("File JSON phải chứa một mảng các đối tượng kiến thức.");
        }

        const processedData = processSeoData(rawData);
        
        if (processedData.length === 0) {
          toast({
            title: "Thông báo",
            description: "File JSON không chứa dữ liệu hợp lệ để import.",
            variant: "default",
          });
          return;
        }

        await bulkCreate.mutateAsync(processedData);
        toast({
          title: "Import thành công!",
          description: `Đã thêm ${processedData.length} kiến thức SEO vào hệ thống`,
        });
        onImportSuccess();
        setOpen(false);
        setSelectedFile(null);
      } catch (error: any) {
        console.error('Bulk import error:', error);
        toast({
          title: "Lỗi",
          description: error.message || "Có lỗi xảy ra khi import file JSON. Vui lòng kiểm tra định dạng file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary">
          <Upload className="w-4 h-4 mr-2" />
          Import JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-chat-seo-main" />
            Import kiến thức SEO từ file JSON
          </DialogTitle>
        </DialogHeader>
        <CardContent className="p-0">
          <form onSubmit={(e) => { e.preventDefault(); handleBulkImport(); }} className="space-y-4"> {/* Added form tag */}
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
              {bulkCreate.isPending ? (
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Đang xử lý và tạo embedding...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Kéo thả file JSON vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-500">Chỉ chấp nhận file .json</p>
                </div>
              )}
            </div>

            <input
              id="json-upload"
              type="file"
              ref={fileInputRef}
              accept="application/json"
              onChange={handleFileChange}
              disabled={bulkCreate.isPending}
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
                  disabled={bulkCreate.isPending}
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
                  handleRemoveFile(); // Clear selected file on close
                }}
                disabled={bulkCreate.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={bulkCreate.isPending || !selectedFile}
                className="bg-chat-seo-main hover:bg-chat-seo-main/90"
              >
                {bulkCreate.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import dữ liệu
                  </>
                )}
              </Button>
            </div>
          </form> {/* Closed form tag */}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSeoKnowledgeDialog;