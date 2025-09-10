"use client";

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
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery<UserProfile | null>({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // The relationship is many-to-one (many employees to one manager).
      // For self-referencing foreign keys, we need to be explicit with the foreign key column name.
      // The syntax is `alias:referenced_table!foreign_key_column(columns)`.
      const { data: fullData, error: fullError } = await supabase
        .from("profiles")
        .select(`
          *, 
          teams(id, name),
          manager:profiles!manager_id(id, full_name, email)
        `)
        .eq("id", user.id)
        .single();

      if (fullError) {
        console.warn("Failed to fetch profile with manager, retrying without. Error:", fullError.message);
        
        // Fallback query without the manager relation
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("profiles")
          .select(`
            *, 
            teams(id, name)
          `)
          .eq("id", user.id)
          .single();

        if (fallbackError) {
          console.error("Error fetching user profile after fallback:", fallbackError);
          throw fallbackError;
        }

        if (fallbackData) {
          // Explicitly set manager to null as it wasn't fetched
          (fallbackData as any).manager = null;
        }
        
        return fallbackData as UserProfile | null;
      }
      
      if (fullData) {
        const processedData = {
          ...fullData,
          manager: Array.isArray(fullData.manager) ? fullData.manager[0] || null : fullData.manager,
        };
        return processedData as unknown as UserProfile | null;
      }
      
      return null;
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
  });
};