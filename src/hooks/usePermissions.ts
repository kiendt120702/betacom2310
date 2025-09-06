import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./types/userTypes";
import { useAuth } from "./useAuth";
import { useUserProfile } from "./useUserProfile";

// Manually define types as the generated ones seem to be out of sync
export type Permission = {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string | null;
};

export type UserPermission = {
  user_id: string;
  permission_id: string;
  permission_type: 'grant' | 'deny';
};

export type RolePermission = { 
  role: UserRole, 
  permission_id: string 
};

export interface PermissionNode extends Permission {
  children: PermissionNode[];
}

// Hook to fetch all permissions (now returns a flat list)
export const useAllPermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions" as any)
        .select("*")
        .order("description"); // Order by description for display
      
      if (error) {
        console.error("❌ Error fetching permissions:", error);
        throw new Error(error.message);
      }
      return data as unknown as Permission[];
    },
  });
};

// Hook to fetch permissions for a specific role
export const useRolePermissions = (role: UserRole | null) => {
  return useQuery<string[]>({
    queryKey: ["role-permissions", role],
    queryFn: async () => {
      if (!role) return [];
      const { data, error } = await supabase
        .from("role_permissions" as any)
        .select("permission_id")
        .eq("role", role);
      
      if (error) {
        console.error("❌ Error fetching role permissions:", error);
        throw new Error(error.message);
      }
      
      const permissionIds = (data as unknown as { permission_id: string }[]).map(p => p.permission_id);
      return permissionIds;
    },
    enabled: !!role,
  });
};

// Hook to fetch individual permission overrides for a user
export const useUserPermissionOverrides = (userId: string | null) => {
  return useQuery<UserPermission[]>({
    queryKey: ["user-permission-overrides", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_permissions" as any)
        .select("*")
        .eq("user_id", userId);
      
      if (error) {
        console.error("❌ Error fetching user permission overrides:", error);
        throw new Error(error.message);
      }
      
      return data as unknown as UserPermission[];
    },
    enabled: !!userId,
  });
};

// Hook to update a user's permission overrides
export const useUpdateUserPermissionOverrides = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      permissionOverrides: { permission_id: string; permission_type: 'grant' | 'deny' }[];
    }) => {
      const { userId, permissionOverrides } = variables;
      const { error } = await supabase.rpc('update_user_permission_overrides' as any, {
        p_user_id: userId,
        p_permission_overrides: permissionOverrides,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-permission-overrides", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions-set", variables.userId] }); // Invalidate the combined set
      toast({
        title: "Thành công",
        description: "Quyền của người dùng đã được cập nhật.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật quyền: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useAllRolePermissions = () => {
  return useQuery<RolePermission[]>({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions" as any)
        .select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as RolePermission[];
    },
  });
};

// Hook to update permissions for a role
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: {
      role: UserRole;
      permissionIds: string[];
    }) => {
      const { role, permissionIds } = variables;
      const { error } = await supabase.rpc('update_role_permissions' as any, {
        p_role: role,
        p_permission_ids: permissionIds,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["role-permissions", variables.role] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions-set"] }); // Invalidate all users' permission sets
      toast({
        title: "Thành công",
        description: `Quyền cho vai trò ${variables.role} đã được cập nhật.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật quyền cho vai trò: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook to get the final set of permissions for the current user
export const usePermissions = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();

  return useQuery({
    queryKey: ["user-permissions-set", user?.id],
    queryFn: async () => {
      if (!user || !profile) return new Set<string>();

      const { data: rolePermissionsData, error: roleError } = await supabase
        .from("role_permissions" as any)
        .select("permissions(name)")
        .eq("role", profile.role);
      
      if (roleError) throw roleError;

      const { data: userOverridesData, error: overrideError } = await supabase
        .from("user_permissions" as any)
        .select("permission_type, permissions(name)")
        .eq("user_id", user.id);
      
      if (overrideError) throw overrideError;

      const permissions = new Set(rolePermissionsData.map((p: any) => p.permissions.name));

      userOverridesData.forEach((override: any) => {
        if (override.permission_type === 'grant') {
          permissions.add(override.permissions.name);
        } else if (override.permission_type === 'deny') {
          permissions.delete(override.permissions.name);
        }
      });

      return permissions;
    },
    enabled: !!user && !!profile,
    staleTime: 5 * 60 * 1000,
  });
};