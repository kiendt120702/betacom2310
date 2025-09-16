"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";
import { Segment } from "./useSegments";
import { ProfileSegmentRole } from "./useProfileSegmentRoles";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Team = Database["public"]["Tables"]["departments"]["Row"];

export type UserProfile = Profile & {
  manager_id: string | null;
  teams: Team | null;
  manager: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  profile_segment_roles?: (ProfileSegmentRole & { segments: Segment | null })[];
};

/**
 * Custom hook to fetch and manage user profile data
 * Handles profile fetching with error recovery
 */
export const useUserProfile = () => {
  const { user } = useAuth();

  const selectQuery = `
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
    teams:departments ( id, name ),
    manager:profiles!manager_id ( id, full_name, email ),
    profile_segment_roles ( *, segments ( name ) )
  `;

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user ID available");

      console.log("Fetching profile for user:", user.id);
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(selectQuery)
        .eq("id", user.id)
        .single();

      // Gracefully handle "No rows found" as a non-error case for profile creation
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (profile && typeof profile === 'object' && !Array.isArray(profile) && 'id' in profile) {
        console.log("Profile loaded:", profile);
        const processedProfile = {
          ...(profile as object),
          manager: Array.isArray((profile as any).manager) ? (profile as any).manager[0] || null : (profile as any).manager,
        };
        return processedProfile as UserProfile;
      }

      // If no profile, create one
      console.log("No profile found, creating one for user:", user.id);
      
      const { data: newProfileData, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          role: 'chuyên viên'
        })
        .select(selectQuery)
        .single();
        
      if (createError) {
        console.error("Error creating profile:", createError);
        throw new Error("Failed to create user profile");
      }

      if (!newProfileData) {
        throw new Error("Failed to retrieve newly created profile.");
      }
      
      console.log("Profile created successfully:", newProfileData);
      if (typeof newProfileData === 'object' && newProfileData !== null && !Array.isArray(newProfileData) && 'id' in newProfileData) {
        const processedNewProfile = {
          ...(newProfileData as object),
          manager: Array.isArray((newProfileData as any).manager) ? (newProfileData as any).manager[0] || null : (newProfileData as any).manager,
        };
        return processedNewProfile as UserProfile;
      }
      
      throw new Error("Received invalid data for new profile.");
    },
    enabled: !!user?.id,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("Profile loading error") || 
          error?.message?.includes("infinite recursion") ||
          error?.message?.includes("policy")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};