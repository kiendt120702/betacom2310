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

      let data: UserProfile | null = null;
      let error: any = null;

      // Helper to process fetched data, checking for error objects
      const processFetchedData = (fetchedData: any, fetchedError: any): { data: UserProfile | null, error: any } => {
        if (fetchedData && typeof fetchedData === 'object' && !('error' in fetchedData)) {
          return { data: fetchedData as UserProfile, error: fetchedError };
        } else {
          return { data: null, error: fetchedError || fetchedData }; // Assign the actual error or the ParserError object
        }
      };

      // Attempt the full query first, including the manager relation
      const result1 = await supabase
        .from("profiles")
        .select(`
          *, 
          teams(id, name),
          manager:profiles!manager_id(id, full_name, email)
        `)
        .eq("id", user.id)
        .single();
      
      ({ data, error } = processFetchedData(result1.data, result1.error));

      // If the first query failed or returned a ParserError, try the fallback
      if (error && (error.message?.includes('manager_id') || error.message?.includes('manager:profiles') || (error.error && typeof error.error === 'string' && error.error.includes('Unexpected input')))) {
        console.warn("Manager fields not available or select string parsing failed, fetching without manager data:", error.message || error.error);
        
        const result2 = await supabase
          .from("profiles")
          .select(`
            *, 
            teams(id, name)
          `)
          .eq("id", user.id)
          .single();
        
        ({ data, error } = processFetchedData(result2.data, result2.error));

        // Explicitly set manager to null if it wasn't fetched by the fallback query
        if (data) {
            data.manager = null;
        }
      }
      
      // If there's still an error and data is null, throw it
      if (error && data === null) {
        console.error("Error fetching user profile after all attempts:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
    // Add placeholderData to keep the previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};