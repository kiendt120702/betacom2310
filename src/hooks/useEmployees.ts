import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type Employee = Tables<'employees'> & {
  leader_id: string | null;
  team_id: string | null;
  teams: { name: string } | null;
};

export type CreateEmployeeData = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'teams'>;
export type UpdateEmployeeData = Partial<CreateEmployeeData>;

interface UseEmployeesParams {
  page: number;
  pageSize: number;
  role?: 'personnel' | 'leader';
  leaderId?: string;
  searchTerm?: string;
}

export const useEmployees = ({ page, pageSize, role, leaderId, searchTerm }: UseEmployeesParams) => {
  return useQuery({
    queryKey: ["employees", page, pageSize, role, leaderId, searchTerm],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("employees")
        .select(`*, teams(name)`, { count: 'exact' });

      if (role) {
        query = query.eq('role', role);
      }
      if (leaderId && leaderId !== "all") {
        query = query.eq('leader_id', leaderId);
      }
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error, count } = await query.order("name").range(from, to);
      if (error) throw new Error(error.message);
      
      const mappedData = data.map(emp => ({
        ...emp,
        team_id: emp.team_id || null,
        teams: emp.teams || null,
      }));

      return { employees: mappedData as Employee[], totalCount: count || 0 };
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
      if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
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
      if (error) throw new Error(error.message);
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