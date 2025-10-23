import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { mockApi, SysDepartment } from "@/integrations/mock";

export type Team = SysDepartment;

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ["teams"], // Giữ nguyên queryKey để tương thích
    queryFn: async () => {
      const departments = await mockApi.listDepartments();
      return departments as Team[];
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (name: string) => {
      const department = await mockApi.createDepartment(name);
      return department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Thành công",
        description: "Đã tạo phòng ban mới.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message.includes("duplicate key value")
          ? "Tên phòng ban đã tồn tại."
          : `Không thể tạo phòng ban: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const updated = await mockApi.updateDepartment(id, name);
      if (!updated) {
        throw new Error("Không tìm thấy phòng ban để cập nhật.");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật phòng ban.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật phòng ban: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const deleted = await mockApi.deleteDepartment(id);
      if (!deleted) {
        throw new Error("Không thể xóa phòng ban.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa phòng ban: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
