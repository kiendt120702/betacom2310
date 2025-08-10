
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "leader" | "chuyên viên";
  work_type: "fulltime" | "parttime";
  team_id: string | null;
  created_at: string;
  updated_at: string;
  teams: {
    id: string;
    name: string;
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
