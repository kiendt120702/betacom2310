import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserProfile } from "./useUserProfile";
import { Database } from "@/types/supabase";
import { CreateUserData, UpdateUserData } from "./types/userTypes";
import { secureLog } from "@/lib/utils";

type UserRole = Database["public"]["Enums"]["user_role"];
type WorkType = Database["public"]["Enums"]["work_type"];

interface UseUsersParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedRole: string;
  selectedTeam: string;
}

export const useUsers = ({ page, pageSize, searchTerm, selectedRole, selectedTeam }: UseUsersParams) => {
  const { user } = useAuth();

  return useOptimizedQuery({
    queryKey: ["users", user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam],
    dependencies: [user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam],
    queryFn: async () => {
      if (!user) return { users: [], totalCount: 0 };

      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          work_type,
          team_id,
          created_at,
          updated_at,
          join_date,
          manager_id,
          teams(id, name),
          manager:profiles!manager_id(id, full_name, email)
        `, { count: "exact" });

      // Users with 'deleted' role are now hard-deleted, but this is a safeguard
      query = query.neq("role", "deleted");

      if (selectedRole !== "all") {
        query = query.eq('role', selectedRole as UserRole);
      }
      if (selectedTeam === "no-team") {
        query = query.is('team_id', null);
      } else if (selectedTeam !== "all") {
        query = query.eq('team_id', selectedTeam);
      }

      if (searchTerm) {
        const searchPattern = `%${searchTerm.trim()}%`;
        query = query.or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      secureLog("Fetched users data:", { 
        count: data?.length, 
        sampleUser: data?.[0] ? {
          id: data[0].id,
          manager_id: data[0].manager_id,
          manager: data[0].manager
        } : null
      });

      return { 
        users: (data || []) as unknown as UserProfile[], 
        totalCount: count || 0 
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
        team_id: userData.team_id,
        work_type: userData.work_type 
      });

      if (!userData.email || !userData.password) {
        throw new Error("Email và mật khẩu là bắt buộc");
      }

      const userMetadata = {
        full_name: userData.full_name || "",
        role: userData.role,
        team_id: userData.team_id,
        work_type: userData.work_type || "fulltime",
        phone: userData.phone || ""
      };

      const { data, error: funcError } = await supabase.functions.invoke(
        "create-user",
        {
          body: {
            email: userData.email,
            password: userData.password,
            userData: userMetadata,
          },
        },
      );

      if (funcError) throw new Error(`Lỗi tạo tài khoản: ${funcError.message}`);
      if (data?.error) throw new Error(`Lỗi tạo tài khoản: ${data.error}`);
      if (!data?.user) throw new Error("Không thể tạo user");

      return data.user;
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
      const profileUpdateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (userData.full_name !== undefined) profileUpdateData.full_name = userData.full_name;
      if (userData.email !== undefined) profileUpdateData.email = userData.email;
      if (userData.phone !== undefined) profileUpdateData.phone = userData.phone;
      if (userData.role !== undefined) profileUpdateData.role = userData.role;
      if (userData.team_id !== undefined) profileUpdateData.team_id = userData.team_id;
      if (userData.work_type !== undefined) profileUpdateData.work_type = userData.work_type;
      if (userData.join_date !== undefined) profileUpdateData.join_date = userData.join_date;
      if (userData.manager_id !== undefined) profileUpdateData.manager_id = userData.manager_id;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdateData)
        .eq("id", userData.id);

      if (profileError) throw new Error(`Lỗi cập nhật hồ sơ: ${profileError.message}`);

      if (userData.password || userData.email) {
        const { data, error: funcError } = await supabase.functions.invoke(
          "manage-user-profile",
          {
            body: {
              userId: userData.id,
              email: userData.email,
              newPassword: userData.password,
              oldPassword: userData.oldPassword,
            },
          },
        );

        if (funcError) {
          let errorMessage = "Lỗi không xác định từ server.";
          try {
            // The context of a FunctionsHttpError is the Response object
            const errorJson = await funcError.context.json();
            if (errorJson && errorJson.error) {
              errorMessage = errorJson.error;
            } else {
              errorMessage = funcError.message;
            }
          } catch (e) {
            // Fallback if parsing fails
            errorMessage = funcError.message;
          }
          throw new Error(errorMessage);
        }
        if (data?.error) throw new Error(data.error);
      }

      return userData;
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
      const { data, error: funcError } = await supabase.functions.invoke(
        "delete-user",
        {
          body: { userId },
        },
      );

      if (funcError) {
        console.error("Edge function error details:", funcError);
        const contextError = (funcError as any).context?.data?.error;
        const errMsg = contextError || funcError.message || "Failed to delete user";
        throw new Error(errMsg);
      }
      if (data?.error) {
        throw new Error(data.error);
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

      const { data, error } = await supabase.functions.invoke(
        "bulk-create-users",
        {
          body: { users },
        }
      );

      if (error) throw new Error(`Lỗi server: ${error.message}`);
      if (data.error) throw new Error(`Lỗi xử lý: ${data.error}`);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      secureLog("Bulk user creation failed:", error);
    },
  });
};
