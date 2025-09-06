import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./types/userTypes";

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

// Hook to fetch all permissions and structure them as a tree
export const useAllPermissions = () => {
  return useQuery<PermissionNode[]>({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      console.log("🔍 Fetching all permissions...");
      const { data, error } = await supabase
        .from("permissions" as any)
        .select("*")
        .order("name");
      
      if (error) {
        console.error("❌ Error fetching permissions:", error);
        throw new Error(error.message);
      }

      console.log("✅ Permissions data:", data);
      const permissions = data as unknown as Permission[];
      const tree: PermissionNode[] = [];
      const map = new Map<string, PermissionNode>();

      permissions.forEach(p => {
        map.set(p.id, { ...p, children: [] });
      });

      permissions.forEach(p => {
        if (p.parent_id && map.has(p.parent_id)) {
          map.get(p.parent_id)!.children.push(map.get(p.id)!);
        } else {
          tree.push(map.get(p.id)!);
        }
      });

      console.log("🌳 Built permission tree:", tree);
      return tree;
    },
  });
};

// Hook to fetch permissions for a specific role
export const useRolePermissions = (role: UserRole | null) => {
  return useQuery<string[]>({
    queryKey: ["role-permissions", role],
    queryFn: async () => {
      if (!role) return [];
      console.log("🔍 Fetching role permissions for:", role);
      const { data, error } = await supabase
        .from("role_permissions" as any)
        .select("permission_id")
        .eq("role", role);
      
      if (error) {
        console.error("❌ Error fetching role permissions:", error);
        throw new Error(error.message);
      }
      
      const permissionIds = (data as unknown as { permission_id: string }[]).map(p => p.permission_id);
      console.log(`✅ Role ${role} permissions:`, permissionIds);
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
      console.log("🔍 Fetching user permission overrides for:", userId);
      const { data, error } = await supabase
        .from("user_permissions" as any)
        .select("*")
        .eq("user_id", userId);
      
      if (error) {
        console.error("❌ Error fetching user permission overrides:", error);
        throw new Error(error.message);
      }
      
      console.log("✅ User permission overrides:", data);
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