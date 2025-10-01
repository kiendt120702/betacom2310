import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Upload, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTiktokShops } from "@/hooks/useTiktokShops";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ReportType = "monthly_report" | "cancelled_revenue";

const reportTypeOptions: { value: ReportType; label: string; functionName: string }[] = [
  { value: "monthly_report", label: "Báo cáo tháng", functionName: "upload-tiktok-report" },
  { value: "cancelled_revenue", label: "Doanh số hủy", functionName: "upload-tiktok-cancelled-revenue" },
];

const TiktokReportUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [reportType, setReportType] = useState<ReportType>("monthly_report");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();
  const [open, setOpen] = useState(false);

  const handleUpload = async () => {
    if (!file || !selectedShop || !reportType) {
      toast({ title: "Lỗi", description: "Vui lòng chọn shop, loại báo cáo và file để upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("shop_id", selectedShop);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const selectedReportType = reportTypeOptions.find(opt => opt.value === reportType);
      if (!selectedReportType) {
        throw new Error("Loại báo cáo không hợp lệ");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/${selectedReportType.functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload file');
      }

      toast({ title: "Thành công", description: responseData.message });
      queryClient.invalidateQueries({ queryKey: ["tiktok-comprehensive-reports"] });
      setFile(null);
      setSelectedShop("");
    } catch (error: any) {
      const errorMessage = error.message || "Không thể upload file.";
      toast({ title: "Lỗi", description: errorMessage, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại báo cáo" />
          </SelectTrigger>
          <SelectContent>
            {reportTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
          <Input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={isUploading} />
        </div>
        <Button onClick={handleUpload} disabled={isUploading || !file || !selectedShop} className="w-full sm:w-auto">
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploading ? "Đang xử lý..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default TiktokReportUploader;