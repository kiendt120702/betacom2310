import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Upload, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useShops } from "@/hooks/useShops";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const MultiDayReportUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];
  const [open, setOpen] = useState(false);

  const handleUpload = async () => {
    if (!file || !selectedShop) {
      toast({ title: "Lỗi", description: "Vui lòng chọn shop và file để upload.", variant: "destructive" });
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

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/upload-multi-day-report`,
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
      queryClient.invalidateQueries({ queryKey: ["comprehensiveReports"] });
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
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-48">
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
          <PopoverContent className="w-[200px] p-0">
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
      <div className="flex-grow w-full">
        <Input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={isUploading} />
      </div>
      <Button onClick={handleUpload} disabled={isUploading || !file || !selectedShop} className="w-full sm:w-auto">
        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isUploading ? "Đang xử lý..." : "Upload"}
      </Button>
    </div>
  );
};

export default MultiDayReportUpload;