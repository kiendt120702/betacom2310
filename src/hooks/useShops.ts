import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type Shop = Tables<'shops'> & {
  personnel_name?: string | null;
  leader_name?: string | null;
};

export type CreateShopData = {
  name: string;
  personnel_name?: string | null;
  leader_name?: string | null;
};

export type UpdateShopData = Partial<CreateShopData>;

export const useShops = () => {
  return useQuery<Shop[]>({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Shop[];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shopData: CreateShopData) => {
      const { data, error } = await supabase
        .from("shops")
        .insert([shopData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast({
        title: "Thành công",
        description: "Đã tạo shop mới thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo shop mới.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateShopData) => {
      const { data, error } = await supabase
        .from("shops")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật shop thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật shop.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shops")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      toast({
        title: "Thành công",
        description: "Đã xóa shop thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa shop.",
        variant: "destructive",
      });
    },
  });
};

// This hook is no longer needed for shop management but might be used elsewhere.
export const useShopAssignableUsers = () => {
  return useQuery({
    queryKey: ["shopAssignableUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("role", ["chuyên viên", "học việc/thử việc", "leader"])
        .order("full_name");

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};