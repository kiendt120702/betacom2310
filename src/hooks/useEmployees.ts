import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

// Define the Employee type to correctly reflect the data structure from the 'employees' table
export type Employee = Tables<'employees'> & {
  leader_id: string | null;
  team_id: string | null; // Directly include team_id as it's now a column in 'employees' table
  teams: { name: string } | null; // Add the joined 'teams' relation here
};

// Omit 'profiles' from CreateEmployeeData as it's not part of the direct insert/update
export type CreateEmployeeData = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'teams'>;
export type UpdateEmployeeData = Partial<CreateEmployeeData>;

export const useEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      // Directly select all columns, including team_id, from the 'employees' table
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          teams(name) // Optionally join teams to get team name if needed for display
        `)
        .order("name");
      if (error) throw error;
      
      // Map the data to ensure team_id is directly on the Employee object
      // and handle the joined team name if available
      const mappedData = data.map(emp => ({
        ...emp,
        team_id: emp.team_id || null, // Ensure team_id is explicitly set from the direct column
        teams: emp.teams || null, // Ensure teams is explicitly set
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