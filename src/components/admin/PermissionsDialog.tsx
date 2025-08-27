import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfile } from "@/hooks/useUserProfile";
import { useAllPermissions, useRolePermissions, useUserPermissionOverrides, useUpdateUserPermissionsAndRole, PermissionNode } from "@/hooks/usePermissions";
import { useRoles } from "@/hooks/useRoles";
import { UserRole } from "@/hooks/types/userTypes";
import { Loader2 } from "lucide-react";

interface PermissionsDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ user, open, onOpenChange }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});

  const { data: allPermissions = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: roles = [] } = useRoles();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useRolePermissions(selectedRole);
  const { data: userOverrides, isLoading: overridesLoading } = useUserPermissionOverrides(user.id);
  const updateUserPermissions = useUpdateUserPermissionsAndRole();

  useEffect(() => {
    if (rolePermissions && userOverrides) {
      const initialState: Record<string, boolean> = {};
      const grantOverrides = new Set(userOverrides?.filter(o => o.permission_type === 'grant').map(o => o.permission_id));
      const denyOverrides = new Set(userOverrides?.filter(o => o.permission_type === 'deny').map(o => o.permission_id));

      const allPermissionIds: string[] = [];
      const flatten = (nodes: PermissionNode[]) => {
        nodes.forEach(node => {
          allPermissionIds.push(node.id);
          if (node.children) flatten(node.children);
        });
      };
      flatten(allPermissions);

      allPermissionIds.forEach(id => {
        if (grantOverrides.has(id)) {
          initialState[id] = true;
        } else if (denyOverrides.has(id)) {
          initialState[id] = false;
        } else {
          initialState[id] = rolePermissions.includes(id);
        }
      });
      setPermissionState(initialState);
    }
  }, [rolePermissions, userOverrides, allPermissions]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissionState(prev => ({ ...prev, [permissionId]: checked }));
  };

  const handleSave = () => {
    const permissionOverrides: { permission_id: string; permission_type: 'grant' | 'deny' }[] = [];
    
    Object.entries(permissionState).forEach(([permissionId, isChecked]) => {
      const isRolePermission = rolePermissions?.includes(permissionId);
      
      if (isChecked && !isRolePermission) {
        permissionOverrides.push({ permission_id: permissionId, permission_type: 'grant' });
      } else if (!isChecked && isRolePermission) {
        permissionOverrides.push({ permission_id: permissionId, permission_type: 'deny' });
      }
    });

    updateUserPermissions.mutate({
      userId: user.id,
      newRole: selectedRole,
      permissionOverrides,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const renderPermissionTree = (nodes: PermissionNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center space-x-2 my-2">
          <Checkbox
            id={node.id}
            checked={permissionState[node.id] || false}
            onCheckedChange={(checked) => handlePermissionChange(node.id, !!checked)}
          />
          <Label htmlFor={node.id}>{node.name}</Label>
        </div>
        {node.children.length > 0 && renderPermissionTree(node.children, level + 1)}
      </div>
    ));
  };

  const isLoading = permissionsLoading || rolePermissionsLoading || overridesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Phân quyền cho: {user.full_name || user.email}</DialogTitle>
          <DialogDescription>
            Chọn vai trò và tùy chỉnh quyền hạn chi tiết cho người dùng này.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Label>Quyền hạn chi tiết</Label>
          <ScrollArea className="h-full mt-2 border rounded-md p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              renderPermissionTree(allPermissions)
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={updateUserPermissions.isPending}>
            {updateUserPermissions.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;