"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserProfile } from "./useUserProfile";
import { Database } from "@/integrations/supabase/types/database";
import { CreateUserData, UpdateUserData } from "./types/userTypes";

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

  return useQuery({
    queryKey: ["users", user?.id, page, pageSize, searchTerm, selectedRole, selectedTeam, selectedManager],
    queryFn: async () => {
      if (!user) return { users: [], totalCount: 0 };

      let data: UserProfile[] | null = null;
      let count: number | null = null;
      let error: any = null;

      // Helper to process fetched data, checking for error objects
      const processFetchedData = (fetchedData: any, fetchedError: any, fetchedCount: number | null): { data: UserProfile[] | null, error: any, count: number | null } => {
        if (Array.isArray(fetchedData) && !('error' in fetchedData)) { // Check if it's an array and not an error object
          return { data: fetchedData as UserProfile[], error: fetchedError, count: fetchedCount };
        } else {
          return { data: null, error: fetchedError || fetchedData, count: 0 }; // Assign the actual error or the ParserError object
        }
      };

      // Base query builder
      const buildQuery = (includeManagerRelation: boolean) => {
        let query: any = supabase // Cast to any here to resolve TS2589
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
            teams(id, name)
            ${includeManagerRelation ? ', manager:profiles!manager_id(id, full_name, email)' : ''}
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
          query = query.eq('manager_id', selectedManager);
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
        
        return query;
      };

      // Attempt with manager relation first
      const result1 = await buildQuery(true);
      ({ data, error, count } = processFetchedData(result1.data, result1.error, result1.count));

      // If the first query failed or returned a ParserError, try the fallback
      if (error && (error.message?.includes('manager_id') || error.message?.includes('manager:profiles') || (error.error && typeof error.error === 'string' && error.error.includes('Unexpected input')))) {
        console.warn("Manager fields not available or select string parsing failed, fetching without manager data:", error.message || error.error);
        
        const result2 = await buildQuery(false);
        ({ data, error, count } = processFetchedData(result2.data, result2.error, result2.count));

        // Manually set manager to null for each user if it wasn't fetched
        if (data) {
            data = data.map(user => ({ ...user, manager: null }));
        }
      }
      
      // If there's still an error and data is null, throw it
      if (error && data === null) {
        console.error("Error fetching users after all attempts:", error);
        throw error;
      }

      return { 
        users: data || [], 
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
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      console.log("=== useUpdateUser DEBUG ===");
      console.log("Received userData:", userData);
      
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

      console.log("Profile update data:", profileUpdateData);

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdateData)
        .eq("id", userData.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw new Error(`Lỗi cập nhật hồ sơ: ${profileError.message}`);
      }

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
    },
  });
};

export const useBulkCreateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (users: CreateUserData[]) => {
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
    },
  });
};