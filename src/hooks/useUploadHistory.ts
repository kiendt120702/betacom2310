
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UploadHistory {
  id: string;
  file_name: string;
  shop_id: string;
  shop_name: string;
  upload_date: string;
  uploaded_by: string;
  uploader_name: string;
  file_size?: number;
  record_count?: number;
  month_year: string;
  status: 'success' | 'error';
  error_message?: string;
}

export const useUploadHistory = (filters?: {
  shop_id?: string;
  month?: string;
  uploaded_by?: string;
}) => {
  return useQuery({
    queryKey: ["uploadHistory", filters],
    queryFn: async (): Promise<UploadHistory[]> => {
      console.log("Fetching upload history with filters:", filters);
      
      let query = supabase
        .from("upload_history")
        .select(`
          *,
          shops!inner(name),
          profiles!inner(full_name)
        `)
        .order("upload_date", { ascending: false });

      if (filters?.shop_id) {
        query = query.eq("shop_id", filters.shop_id);
      }
      if (filters?.month) {
        query = query.eq("month_year", filters.month);
      }
      if (filters?.uploaded_by) {
        query = query.eq("uploaded_by", filters.uploaded_by);
      }

      const { data, error } = await query;
      console.log("Upload history query result:", { data, error });

      if (error) throw new Error(error.message);

      return (data || []).map(record => ({
        id: record.id,
        file_name: record.file_name,
        shop_id: record.shop_id,
        shop_name: record.shops?.name || 'N/A',
        upload_date: record.upload_date,
        uploaded_by: record.uploaded_by,
        uploader_name: record.profiles?.full_name || 'N/A',
        file_size: record.file_size,
        record_count: record.record_count,
        month_year: record.month_year,
        status: record.status,
        error_message: record.error_message,
      }));
    },
  });
};

export const useCreateUploadHistory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      file_name: string;
      shop_id: string;
      file_size?: number;
      record_count?: number;
      month_year: string;
      status: 'success' | 'error';
      error_message?: string;
    }) => {
      console.log("Creating upload history:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("upload_history")
        .insert({
          ...data,
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
        })
        .select()
        .single();

      console.log("Upload history creation result:", { result, error });

      if (error) throw new Error(error.message);
      return result;
    },
    onSuccess: () => {
      console.log("Upload history created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["uploadHistory"] });
    },
    onError: (error: any) => {
      console.error("Upload history creation error:", error);
      toast({
        title: "Lỗi",
        description: `Không thể lưu lịch sử upload: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
