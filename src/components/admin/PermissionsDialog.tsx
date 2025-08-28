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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfile } from "@/hooks/useUserProfile";
import { useAllPermissions, useRolePermissions, useUserPermissionOverrides, useUpdateUserPermissionOverrides, PermissionNode } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getPermissionDisplayName = (name: string): string => {
  const nameMap: Record<string, string> = {
    manage_thumbnails_root: "Quản lý Thư viện (Gốc)",
    manage_categories: "Quản lý Danh mục",
    manage_thumbnails: "Quản lý Thumbnails",
    approve_thumbnails: "Duyệt Thumbnails",
    create_thumbnails: "Tạo Thumbnails",
    delete_thumbnails: "Xóa Thumbnails",
    edit_thumbnails: "Sửa Thumbnails",
    view_thumbnails: "Xem Thumbnails",
    manage_thumbnail_types: "Quản lý Loại Thumbnail",
    manage_training_root: "Quản lý Đào tạo (Gốc)",
    grade_essays: "Chấm bài Tự luận",
    manage_edu_shopee: "Quản lý Edu Shopee",
    system_access: "Truy cập hệ thống",
    access_admin_panel: "Truy cập Admin Panel",
    access_leader_view: "Truy cập Leader View",
    manage_general_training: "Quản lý Đào tạo Chung",
    manage_leader_training: "Quản lý Đào tạo Leader",
    manage_specialist_training: "Quản lý Đào tạo Chuyên viên",
    view_learning_progress: "Xem Tiến độ học tập",
    manage_users_root: "Quản lý Người dùng (Gốc)",
    manage_permissions: "Quản lý Quyền hạn",
    manage_roles: "Quản lý Vai trò",
    manage_teams: "Quản lý Phòng ban",
    manage_users: "Quản lý Người dùng",
    create_users: "Tạo Người dùng",
    delete_users: "Xóa Người dùng",
    edit_users: "Sửa Người dùng",
    view_users: "Xem Người dùng",
  };
  return nameMap[name] || name;
};

interface PermissionsDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ user, open, onOpenChange }) => {
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});

  const { data: allPermissions = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useRolePermissions(user.role);
  const { data: userOverrides, isLoading: overridesLoading } = useUserPermissionOverrides(user.id);
  const updateUserOverrides = useUpdateUserPermissionOverrides();

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

    updateUserOverrides.mutate({
      userId: user.id,
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
          <Label htmlFor={node.id}>{getPermissionDisplayName(node.name)}</Label>
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
            Vai trò hiện tại: <Badge variant="secondary">{user.role}</Badge>. Các thay đổi dưới đây sẽ ghi đè quyền mặc định của vai trò này.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col pt-4 overflow-hidden min-h-0">
          <Label className="flex-shrink-0">Quyền hạn chi tiết</Label>
          <ScrollArea className="flex-1 mt-2 border rounded-md p-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                renderPermissionTree(allPermissions)
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={updateUserOverrides.isPending}>
            {updateUserOverrides.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;