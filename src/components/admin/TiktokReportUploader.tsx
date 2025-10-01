import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Upload, Loader2, ChevronsUpDown, Check, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTiktokShops } from "@/hooks/useTiktokShops";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface UploadResult {
  message: string;
  totalRows: number;
  processedRows: number;
  skippedCount: number;
  skippedDetails: { row: number; reason: string }[];
}

interface TiktokReportUploaderProps {
  functionName: string;
}

const TiktokReportUploader: React.FC<TiktokReportUploaderProps> = ({ functionName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setUploadResult(null);
    setStatus('idle');
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file || !selectedShop) {
      toast({ title: "Lỗi", description: "Vui lòng chọn shop và file để upload.", variant: "destructive" });
      return;
    }

    setStatus('uploading');
    setUploadResult(null);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${selectedShop}/${fileName}`;

      // Step 1: Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('report-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setProgress(100);
      setStatus('processing');

      // Step 2: Invoke Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath, shop_id: selectedShop }),
        }
      );

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to process file');

      setUploadResult(responseData);
      toast({ title: "Hoàn tất", description: responseData.message });
      queryClient.invalidateQueries({ queryKey: ["tiktok-comprehensive-reports"] });
      
    } catch (error: any) {
      const errorMessage = error.message || "Không thể upload file.";
      toast({ title: "Lỗi", description: errorMessage, variant: "destructive" });
      setUploadResult({
        message: errorMessage,
        totalRows: 0,
        processedRows: 0,
        skippedCount: 0,
        skippedDetails: [],
      });
    } finally {
      setStatus('done');
    }
  };

  const isUploading = status === 'uploading' || status === 'processing';

  return (
    <div className="space-y-4">
      <div className="w-full sm:w-64">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={shopsLoading || isUploading}
            >
              {selectedShop
                ? shops.find((shop) => shop.id === selectedShop)?.name
                : "Chọn shop..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[256px] p-0">
            <Command>
              <CommandInput placeholder="Tìm kiếm shop..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy shop.</CommandEmpty>
                <CommandGroup>
                  {shops.map((shop) => (
                    <CommandItem
                      key={shop.id}
                      value={shop.name}
                      onSelect={() => {
                        setSelectedShop(shop.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedShop === shop.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {shop.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow w-full">
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} disabled={isUploading} />
        </div>
        <Button onClick={handleUpload} disabled={isUploading || !file || !selectedShop} className="w-full sm:w-auto">
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {status === 'idle' && 'Upload'}
          {status === 'uploading' && 'Đang tải lên...'}
          {status === 'processing' && 'Đang xử lý...'}
          {status === 'done' && 'Upload'}
        </Button>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {status === 'uploading' ? `Đang tải lên... ${progress.toFixed(0)}%` : 'Đang xử lý dữ liệu...'}
          </p>
        </div>
      )}

      {uploadResult && status === 'done' && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg"><p className="text-sm text-blue-700">Tổng số dòng</p><p className="text-2xl font-bold text-blue-900">{uploadResult.totalRows}</p></div>
              <div className="p-3 bg-green-50 rounded-lg"><p className="text-sm text-green-700">Đã xử lý</p><p className="text-2xl font-bold text-green-900">{uploadResult.processedRows}</p></div>
              <div className="p-3 bg-red-50 rounded-lg"><p className="text-sm text-red-700">Bỏ qua</p><p className="text-2xl font-bold text-red-900">{uploadResult.skippedCount}</p></div>
            </div>
            {uploadResult.skippedCount > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Chi tiết các dòng bị bỏ qua (hiển thị tối đa 20 dòng đầu tiên)</h4>
                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Dòng số</TableHead>
                        <TableHead>Lý do</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadResult.skippedDetails.slice(0, 20).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell className="text-red-600">{item.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TiktokReportUploader;