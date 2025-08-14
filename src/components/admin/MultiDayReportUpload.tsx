import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Upload, DollarSign, Loader2 } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Upload Báo cáo Nhiều Ngày
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setSelectedShop} value={selectedShop} disabled={shopsLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn shop..." />
          </SelectTrigger>
          <SelectContent>
            {shopsLoading ? <SelectItem value="loading" disabled>Đang tải...</SelectItem> :
              shops.map(shop => <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button onClick={handleUpload} disabled={isUploading || !file || !selectedShop}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploading ? "Đang xử lý..." : "Upload File"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MultiDayReportUpload;