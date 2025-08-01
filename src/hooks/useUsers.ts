import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserProfile } from "./useUserProfile";
import { Database } from "@/integrations/supabase/types";
import { CreateUserData, UpdateUserData } from "./types/userTypes";

type UserRole = Database["public"]["Enums"]["user_role"];

export const useUsers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!user) return [];

      console.log("Fetching users for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*, teams(id, name)")
        .neq("role", "deleted")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      console.log("Fetched raw users from DB:", data);
      return data as UserProfile[];
    },
    enabled: !!user,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log("Creating user with data:", userData);

      const { data: currentSession } = await supabase.auth.getSession();

      if (!currentSession?.session) {
        throw new Error("No active session found");
      }

      console.log("Current admin session preserved");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: userData.full_name,
            role: userData.role,
            team_id: userData.team_id,
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Không thể tạo user");
      }

      console.log("New user created:", authData.user.id);

      const { error: sessionError } = await supabase.auth.setSession(
        currentSession.session,
      );

      if (sessionError) {
        console.error("Session restore error:", sessionError);
      } else {
        console.log("Admin session restored successfully");
      }

      return authData.user;
    },
    onSuccess: () => {
      console.log("User creation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("User creation failed:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      console.log("Updating user with data:", userData);

      // Prepare data for profile update
      const profileUpdateData: {
        full_name?: string;
        email?: string; // Added email
        role?: UserRole;
        team_id?: string | null;
        updated_at: string;
      } = {
        full_name: userData.full_name,
        email: userData.email, // Pass email to profile update data
        role: userData.role,
        team_id: userData.team_id,
        updated_at: new Date().toISOString(),
      };

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdateData)
        .eq("id", userData.id);

      if (profileError) {
        console.error("Error updating user profile:", profileError);
        throw profileError;
      }

      // If password or email is provided, call Edge Function to update auth password
      // This now handles both admin reset and self-change with old password verification
      if (userData.password || userData.email) {
        // Check for email as well
        console.log(
          "Password or Email provided, invoking manage-user-profile edge function for auth update...",
        );
        const { data, error: funcError } = await supabase.functions.invoke(
          "manage-user-profile",
          {
            body: {
              userId: userData.id,
              email: userData.email, // Pass email to edge function
              newPassword: userData.password,
              oldPassword: userData.oldPassword,
            },
          },
        );

        if (funcError) {
          let errorMessage = "Failed to update user password or email."; // Updated error message
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
          console.error("Error updating user via Edge Function:", funcError);
          throw new Error(errorMessage);
        }
        if (data?.error) {
          throw new Error(data.error);
        }
        console.log(
          "User auth (password/email) updated successfully via Edge Function.",
        ); // Updated log
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log("Deleting user with ID:", userId);

      const { data, error: funcError } = await supabase.functions.invoke(
        "delete-user",
        {
          body: { userId },
        },
      );

      if (funcError || data?.error) {
        const errMsg =
          funcError?.message || data?.error || "Failed to delete user";
        console.error("Error deleting user from auth:", errMsg);
        throw new Error(errMsg);
      }

      console.log("Auth user and profile deleted successfully");
    },
    onSuccess: () => {
      console.log("User deletion successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("User deletion failed:", error);
    },
  });
};
