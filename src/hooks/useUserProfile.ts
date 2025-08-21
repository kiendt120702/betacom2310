import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserRole, WorkType } from "./types/userTypes"; // Import UserRole and WorkType

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole; // Sử dụng kiểu UserRole đã được cập nhật
  work_type: WorkType; // Sử dụng kiểu WorkType
  team_id: string | null;
  created_at: string;
  updated_at: string;
  join_date: string | null;
  manager_id: string | null;
  teams: {
    id: string;
    name: string;
  } | null;
  manager?: {
    full_name: string | null;
  } | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*, teams(id, name)")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!user,
    // Add placeholderData to keep the previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};