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

      if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        console.error("Error fetching user profile:", error);
        throw error;
      }

      // If no profile exists, create one automatically (self-healing)
      if (!data) {
        console.warn(`Profile not found for user ${user.id}. Creating one now.`);
        
        // Determine role based on email
        const isAdminEmail = user.email === 'admin@betacom.site' || user.email === 'betacom.work@gmail.com';
        const defaultRole = isAdminEmail ? 'admin' : 'chuyên viên';

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email,
            role: defaultRole, // Use determined role
          })
          .select("*, teams(id, name)")
          .single();

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          throw insertError;
        }
        
        console.log("Successfully created new profile:", newProfile);
        return newProfile as UserProfile;
      }

      return data as UserProfile;
    },
    enabled: !!user,
    // Add placeholderData to keep the previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};