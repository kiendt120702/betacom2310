import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { mockApi, SysRole as Role } from "@/integrations/mock";

export type { Role };

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const roles = await mockApi.listRoles();
      return roles as Role[];
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleData: { name: string; description?: string }) => {
      const role = await mockApi.createRole(roleData);
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Thành công",
        description: "Vai trò đã được tạo thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; name?: string; description?: string }) => {
      const updated = await mockApi.updateRole(id, {
        ...updateData,
        updated_at: new Date().toISOString(),
      });
      if (!updated) {
        throw new Error("Không tìm thấy vai trò để cập nhật");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Thành công",
        description: "Vai trò đã được cập nhật thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const deleted = await mockApi.deleteRole(id);
      if (!deleted) {
        throw new Error("Không thể xóa vai trò");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({
        title: "Thành công",
        description: "Vai trò đã được xóa thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
