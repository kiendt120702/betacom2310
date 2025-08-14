import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserProfile } from "./useUserProfile";
import { Database } from "@/integrations/supabase/types";
import { CreateUserData, UpdateUserData } from "./types/userTypes";
import { secureLog } from "@/lib/utils";

type UserRole = Database["public"]["Enums"]["user_role"];
type WorkType = Database["public"]["Enums"]["work_type"];

export const useUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["users", user?.id], // Add user.id to query key for re-fetching on user change
    queryFn: async () => {
      if (!user) return [];

      secureLog("Fetching users for user:", { userId: user.id });

      // Fetch current user's profile to determine their role and team
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role, team_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        secureLog("Error fetching current user profile:", profileError);
        throw profileError;
      }

      let query = supabase
        .from("profiles")
        .select("*, teams(id, name)")
        .neq("role", "deleted")
        .order("created_at", { ascending: false });

      // Apply filtering based on current user's role
      if (currentUserProfile.role === "leader" && currentUserProfile.team_id) {
        // Corrected logic: Leader sees themselves OR (users in their team AND with specific roles)
        query = query.or(
          `id.eq.${user.id},and(team_id.eq.${currentUserProfile.team_id},role.in.("chuyên viên", "học việc/thử việc"))`
        );
      } else if (currentUserProfile.role === "chuyên viên" || currentUserProfile.role === "học việc/thử việc") {
        // Regular users only see themselves
        query = query.eq("id", user.id);
      }
      // Admins see all, no additional filtering needed for them

      const { data, error } = await query;

      if (error) {
        secureLog("Error fetching users:", error);
        throw error;
      }

      secureLog("Fetched raw users from DB:", { count: data?.length });
      return data as UserProfile[];
    },
    enabled: !!user,
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

      // Validate required fields
      if (!userData.email || !userData.password) {
        throw new Error("Email và mật khẩu là bắt buộc");
      }

      // Prepare metadata with all required fields
      const userMetadata = {
        full_name: userData.full_name || "",
        role: userData.role,
        team_id: userData.team_id,
        work_type: userData.work_type || "fulltime",
        phone: userData.phone || ""
      };

      secureLog("Creating user via secure edge function");

      // Use the secure create-user edge function instead of session switching
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
        secureLog("Edge function error:", funcError);
        throw new Error(`Lỗi tạo tài khoản: ${funcError.message}`);
      }

      if (data?.error) {
        secureLog("User creation error:", data.error);
        throw new Error(`Lỗi tạo tài khoản: ${data.error}`);
      }

      if (!data?.user) {
        throw new Error("Không thể tạo user");
      }

      secureLog("New user created successfully:", { userId: data.user.id });
      return data.user;
    },
    onSuccess: () => {
      secureLog("User creation successful, invalidating queries");
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
      secureLog("Updating user with data:", { 
        id: userData.id, 
        role: userData.role,
        work_type: userData.work_type,
        phone: userData.phone 
      });

      // Prepare data for profile update - only include defined values
      const profileUpdateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (userData.full_name !== undefined) profileUpdateData.full_name = userData.full_name;
      if (userData.email !== undefined) profileUpdateData.email = userData.email;
      if (userData.phone !== undefined) profileUpdateData.phone = userData.phone;
      if (userData.role !== undefined) profileUpdateData.role = userData.role;
      if (userData.team_id !== undefined) profileUpdateData.team_id = userData.team_id;
      if (userData.work_type !== undefined) profileUpdateData.work_type = userData.work_type;

      secureLog("Profile update data:", profileUpdateData);

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdateData)
        .eq("id", userData.id);

      if (profileError) {
        secureLog("Error updating user profile:", profileError);
        throw new Error(`Lỗi cập nhật hồ sơ: ${profileError.message}`);
      }

      // If password or email is provided, call Edge Function to update auth password
      if (userData.password || userData.email) {
        secureLog("Password or Email provided, invoking manage-user-profile edge function for auth update...");
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
          let errorMessage = "Failed to update user password or email.";
          if (
            funcError.context &&
            funcError.context.data &&
            typeof funcError.context.data === "object" &&
            "error" in funcError.context.data
          ) {
            errorMessage = (funcError.context.data as { error: string }).error;
          } else if (funcError.message) {
            errorMessage = funcError.message;
          }
          secureLog("Error updating user via Edge Function:", funcError);
          throw new Error(errorMessage);
        }
        if (data?.error) {
          throw new Error(data.error);
        }
        secureLog("User auth (password/email) updated successfully via Edge Function.");
      }

      secureLog("User profile updated successfully");
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
      secureLog("Deleting user with ID:", { userId });

      const { data, error: funcError } = await supabase.functions.invoke(
        "delete-user",
        {
          body: { userId },
        },
      );

      if (funcError || data?.error) {
        const errMsg =
          funcError?.message || data?.error || "Failed to delete user";
        secureLog("Error deleting user from auth:", errMsg);
        throw new Error(errMsg);
      }

      secureLog("Auth user and profile deleted successfully");
    },
    onSuccess: () => {
      secureLog("User deletion successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      secureLog("User deletion failed:", error);
    },
  });
};