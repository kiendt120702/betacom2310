import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, DollarSign, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const RevenueUpload = () => {
  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      const { data, error } = await supabase.functions.invoke("upload-revenue-excel", {
        body: formData,
      });

      if (error) throw error;

      toast({ title: "Thành công", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["shopRevenue"] });
      setFile(null);
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể upload file.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Upload Doanh số
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setSelectedShop} value={selectedShop}>
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

export default RevenueUpload;