"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserProfile } from "./useUserProfile";
import { Database } from "@/integrations/supabase/types/database";
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
  selectedManager: string;
}

export const useUsers = ({ page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager }: UseUsersParams) => {
  const { user } = useAuth();

  return useOptimizedQuery({
    queryKey: ["users", user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager],
    dependencies: [user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager],
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
          teams:departments ( * ),
          profile_segment_roles!profile_id (
            *,
            segments ( name ),
            manager:profiles!manager_id(id, full_name, email)
          )
        `, { count: "exact" });

      query = query.neq("role", "deleted");

      if (selectedRole !== "all") {
        query = query.eq('role', selectedRole as UserRole);
      }
      if (selectedTeam === "no-team") {
        query = query.is('team_id', null);
      } else if (selectedTeam !== "all") {
        query = query.eq('team_id', selectedTeam);
      }
      
      if (selectedManager === "no-manager") {
        query = query.is('manager_id', null);
      } else if (selectedManager !== "all") {
        query = query.or(`manager_id.eq.${selectedManager},profile_segment_roles.manager_id.eq.${selectedManager}`);
      }

      if (searchTerm) {
        const searchPattern = `%${searchTerm.trim()}%`;
        query = query.or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order("created_at", { ascending: false })
        .range(from, to);
      
      const { data: usersData, error, count } = await query;

      if (error) {
        console.error("Error fetching users:", error);
        throw new Error(error.message);
      }
      if (!usersData) return { users: [], totalCount: 0 };

      const managerIds = [...new Set(usersData.map(u => u.manager_id).filter(Boolean))];
      let managersMap = new Map();

      if (managerIds.length > 0) {
        const { data: managers, error: managerError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', managerIds);
        
        if (managerError) {
          console.warn("Could not fetch manager details:", managerError);
        } else {
          managers.forEach(m => managersMap.set(m.id, m));
        }
      }

      const usersWithManagers = usersData.map(u => {
        // Sanitize profile_segment_roles in case of RLS error on nested select
        const sanitizedSegmentRoles = Array.isArray(u.profile_segment_roles) ? u.profile_segment_roles : [];
        
        return {
          ...u,
          profile_segment_roles: sanitizedSegmentRoles,
          manager: u.manager_id ? managersMap.get(u.manager_id) || null : null,
        };
      });

      return { users: usersWithManagers as unknown as UserProfile[], totalCount: count || 0 };
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

      if (funcError) {
        console.error("Edge Function Error Details:", funcError);
        console.error("Function Error Context:", (funcError as any).context);
        
        let errorMessage = "Lỗi không xác định từ Edge Function.";
        
        // Check if it's a network/connection error
        if (funcError.message?.includes('fetch') || funcError.message?.includes('network')) {
          errorMessage = "Không thể kết nối đến Edge Function. Vui lòng kiểm tra kết nối mạng hoặc Supabase service.";
        } else if ((funcError as any).context instanceof Response) {
          try {
            const errorText = await (funcError as any).context.text();
            console.error("Edge Function Response Text:", errorText);
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson?.error) {
                errorMessage = errorJson.error;
              } else {
                errorMessage = errorText || "Phản hồi lỗi không rõ ràng từ Edge Function.";
              }
            } catch (e) {
              errorMessage = errorText || "Không thể phân tích lỗi từ Edge Function.";
            }
          } catch (e) {
            errorMessage = funcError.message || "Không thể phân tích lỗi từ Edge Function.";
          }
        } else {
          errorMessage = funcError.message || "Lỗi không xác định khi gọi Edge Function.";
        }
        
        throw new Error(errorMessage);
      }
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
      secureLog("Updating user via edge function:", { userId: userData.id });

      const { data, error: funcError } = await supabase.functions.invoke(
        "manage-user-profile",
        { 
          body: {
            userId: userData.id,
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            team_id: userData.team_id,
            work_type: userData.work_type,
            join_date: userData.join_date,
            manager_id: userData.manager_id,
            newPassword: userData.password,
            oldPassword: userData.oldPassword,
          },
        }
      );

      if (funcError) {
        console.error("Edge Function Error Details:", funcError);
        let errorMessage = "Lỗi không xác định từ Edge Function.";
        
        // Check if it's a network/connection error
        if (funcError.message?.includes('fetch') || funcError.message?.includes('network')) {
          errorMessage = "Không thể kết nối đến Edge Function. Vui lòng kiểm tra kết nối mạng hoặc Supabase service.";
        } else if ((funcError as any).context instanceof Response) {
          try {
            const errorJson = await (funcError as any).context.json();
            if (errorJson?.error) {
              errorMessage = errorJson.error;
            } else {
              errorMessage = (funcError as any).message || "Phản hồi lỗi không rõ ràng từ Edge Function.";
            }
          } catch (e) {
            errorMessage = (funcError as any).message || "Không thể phân tích lỗi từ Edge Function.";
          }
        } else {
          errorMessage = (funcError as any).message || "Lỗi không xác định khi gọi Edge Function.";
        }
        throw new Error(errorMessage);
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
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
        let errorMessage = "Lỗi không xác định từ Edge Function.";
        if ((funcError as any).context instanceof Response) {
          try {
            const errorJson = await (funcError as any).context.json();
            if (errorJson?.error) {
              errorMessage = errorJson.error;
            } else {
              errorMessage = (funcError as any).message || "Phản hồi lỗi không rõ ràng từ Edge Function.";
            }
          } catch (e) {
            errorMessage = (funcError as any).message || "Không thể phân tích lỗi từ Edge Function.";
          }
        } else {
          errorMessage = (funcError as any).message || "Lỗi không xác định khi gọi Edge Function.";
        }
        throw new Error(errorMessage);
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
