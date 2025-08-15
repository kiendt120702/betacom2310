import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ComprehensiveReportUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Lỗi", description: "Vui lòng chọn file để upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/upload-comprehensive-report`,
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
        Báo cáo 1 ngày
      </h3>
      <div className="flex-grow w-full">
        <Input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={isUploading} />
      </div>
      <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full sm:w-auto">
        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isUploading ? "Đang xử lý..." : "Upload"}
      </Button>
    </div>
  );
};

export default ComprehensiveReportUpload;