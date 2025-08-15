import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useShops } from "@/hooks/useShops";

const MultiDayReportUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: shops = [], isLoading: shopsLoading } = useShops();

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
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg">
      <h3 className="font-semibold whitespace-nowrap flex-shrink-0 text-sm sm:text-base">
        Báo cáo nhiều ngày
      </h3>
      <div className="w-full sm:w-48">
        <Select onValueChange={setSelectedShop} value={selectedShop} disabled={shopsLoading || isUploading}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn shop..." />
          </SelectTrigger>
          <SelectContent>
            {shopsLoading ? <SelectItem value="loading" disabled>Đang tải...</SelectItem> :
              shops.map(shop => <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>)}
          </SelectContent>
        </Select>
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