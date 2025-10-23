"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { useAuth } from "./useAuth";
import { UserProfile } from "./useUserProfile";
import { CreateUserData, UpdateUserData } from "./types/userTypes";
import { secureLog } from "@/lib/utils";
import { mockApi, RoleName } from "@/integrations/mock";

type UserRole = RoleName;

interface UseUsersParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedRole: string;
  selectedTeam: string;
  selectedManager: string;
}

export const useUsers = ({ page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager }: UseUsersParams) => {
  const { user } = useAuth();

  return useOptimizedQuery({
    queryKey: ["users", user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager],
    dependencies: [user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager],
    queryFn: async () => {
      if (!user) return { users: [], totalCount: 0 };

      const response = await mockApi.listUsers({
        page,
        pageSize,
        searchTerm,
        selectedRole,
        selectedTeam,
        selectedManager,
      });

      return {
        users: response.users as unknown as UserProfile[],
        totalCount: response.totalCount,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      secureLog("Creating user with data:", { 
        email: userData.email, 
        role: userData.role,
        department_id: userData.department_id,
        work_type: userData.work_type 
      });

      if (!userData.email || !userData.password) {
        throw new Error("Email và mật khẩu là bắt buộc");
      }

      const response = await mockApi.createUser({
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role as RoleName,
        department_id: userData.department_id,
        work_type: userData.work_type,
      });

      return response.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      secureLog("User creation failed:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      secureLog("Updating user via edge function:", { userId: userData.id });

      const updated = await mockApi.updateUser(userData.id, {
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role as RoleName | undefined,
        department_id: userData.department_id,
        work_type: userData.work_type,
        join_date: userData.join_date,
        manager_id: userData.manager_id,
        password: userData.password,
      });

      if (!updated) {
        throw new Error("Không tìm thấy người dùng để cập nhật");
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      secureLog("User update failed:", error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const deleted = await mockApi.deleteUser(userId);
      if (!deleted) {
        throw new Error("Không thể xóa người dùng");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      secureLog("User deletion failed:", error);
    },
  });
};

export const useBulkCreateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (users: CreateUserData[]) => {
      secureLog("Bulk creating users:", { count: users.length });

      const { created } = await mockApi.bulkCreateUsers(
        users.map((user) => ({
          email: user.email,
          password: user.password,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role as RoleName,
          department_id: user.department_id,
          work_type: user.work_type,
        })),
      );
      
      return { created };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      secureLog("Bulk user creation failed:", error);
    },
  });
};
