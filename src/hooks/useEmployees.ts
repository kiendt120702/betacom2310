import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

// Define the Employee type to correctly reflect the joined data structure
export type Employee = Tables<'employees'> & {
  leader_id: string | null;
  // Explicitly define the joined profiles data structure
  profiles: { team_id: string | null }[] | null;
  // Add a direct team_id property for easier access in components
  team_id: string | null;
};

// Omit 'profiles' from CreateEmployeeData as it's not directly inserted
export type CreateEmployeeData = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'profiles'>;
export type UpdateEmployeeData = Partial<CreateEmployeeData>;

export const useEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          profiles(team_id)
        `)
        .order("name");
      if (error) throw error;
      
      // Map the data to include team_id directly on the Employee object
      const mappedData = data.map(emp => ({
        ...emp,
        // Extract team_id from the first profile if available, otherwise null
        team_id: emp.profiles?.[0]?.team_id || null
      }));

      return mappedData as Employee[];
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (employeeData: CreateEmployeeData) => {
      const { data, error } = await supabase
        .from("employees")
        .insert([employeeData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Thành công", description: "Đã tạo nhân sự mới." });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateEmployeeData) => {
      const { data, error } = await supabase
        .from("employees")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Thành công", description: "Đã cập nhật nhân sự." });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Thành công", description: "Đã xóa nhân sự." });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });
};