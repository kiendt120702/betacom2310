"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { mockApi, HydratedProfile, WorkType } from "@/integrations/mock";

export type UserProfile = HydratedProfile;

/**
 * Custom hook to fetch and manage user profile data
 * Handles profile fetching with error recovery
 */
export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user ID available");

      const profile = await mockApi.getProfileById(user.id);
      if (profile) {
        return profile;
      }

      // Fallback mock profile if not found in dataset
      const fallbackProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || null,
        phone: null,
        role: (user.user_metadata?.role as UserProfile["role"]) || "chuyên viên",
        work_type: (user.user_metadata?.work_type as WorkType) || "fulltime",
        department_id: user.user_metadata?.department_id || null,
        manager_id: null,
        join_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        departments: null,
        manager: null,
      };

      return fallbackProfile;
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
