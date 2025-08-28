import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useAllPermissions, useAllRolePermissions, useUpdateRolePermissions, PermissionNode } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";

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

const roleDisplayNameMap: Record<string, string> = {
  'admin': 'Super Admin',
  'leader': 'Team Leader',
  'chuyên viên': 'Chuyên Viên',
  'học việc/thử việc': 'Học Việc/Thử Việc',
  'trưởng phòng': 'Trưởng Phòng',
};

const roleEnumValueMap: Record<string, UserRole> = {
  'Super Admin': 'admin',
  'Team Leader': 'leader',
  'Chuyên Viên': 'chuyên viên',
  'Học Việc/Thử Việc': 'học việc/thử việc',
  'Trưởng Phòng': 'trưởng phòng',
};

const getRoleEnumValue = (roleName: string): UserRole => {
  return roleEnumValueMap[roleName] || roleName as UserRole;
};

const RolePermissionsMatrix: React.FC = () => {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissionsTree = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: allRolePermissions = [], isLoading: rolePermissionsLoading } = useAllRolePermissions();
  const updateRolePermissions = useUpdateRolePermissions();

  const [permissionState, setPermissionState] = useState<Record<string, Set<string>>>({});
  const [modifiedRoles, setModifiedRoles] = useState<Set<UserRole>>(new Set());

  useEffect(() => {
    if (allRolePermissions.length > 0) {
      const map: Record<string, Set<string>> = {};
      allRolePermissions.forEach(rp => {
        if (!map[rp.role]) {
          map[rp.role] = new Set();
        }
        map[rp.role].add(rp.permission_id);
      });
      setPermissionState(map);
    }
  }, [allRolePermissions]);

  const handlePermissionChange = (role: UserRole, permissionId: string, checked: boolean) => {
    setPermissionState(prev => {
      const newRolePermissions = new Set(prev[role] || []);
      if (checked) {
        newRolePermissions.add(permissionId);
      } else {
        newRolePermissions.delete(permissionId);
      }
      return { ...prev, [role]: newRolePermissions };
    });
    setModifiedRoles(prev => new Set(prev).add(role));
  };

  const handleSave = async () => {
    const promises = Array.from(modifiedRoles).map(role => {
      const permissionIds = Array.from(permissionState[role] || []);
      return updateRolePermissions.mutateAsync({ role, permissionIds });
    });

    await Promise.all(promises);
    setModifiedRoles(new Set());
  };

  const getRoleDisplayName = (roleValue: string): string => {
    return roleDisplayNameMap[roleValue.toLowerCase()] || roleValue;
  };

  const renderPermissionRows = (nodes: PermissionNode[], level = 0): JSX.Element[] => {
    return nodes.flatMap(node => {
      const row = (
        <TableRow key={node.id}>
          <TableCell style={{ paddingLeft: `${level * 24 + 16}px` }} className="whitespace-pre-wrap break-words min-w-0">
            {getPermissionDisplayName(node.name)}
          </TableCell>
          {roles.map(role => {
            const enumRole = getRoleEnumValue(role.name);
            return (
              <TableCell key={role.id} className="text-center">
                <Checkbox
                  checked={permissionState[enumRole]?.has(node.id) || false}
                  onCheckedChange={(checked) => handlePermissionChange(enumRole, node.id, !!checked)}
                />
              </TableCell>
            );
          })}
        </TableRow>
      );
      if (node.children && node.children.length > 0) {
        return [row, ...renderPermissionRows(node.children, level + 1)];
      }
      return [row];
    });
  };

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ma trận Phân quyền theo Vai trò</CardTitle>
            <CardDescription>
              Chỉnh sửa các quyền mặc định cho mỗi vai trò.
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={modifiedRoles.size === 0 || updateRolePermissions.isPending}>
            {updateRolePermissions.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] max-w-[300px]">Quyền hạn</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center min-w-[120px]">{getRoleDisplayName(role.name)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderPermissionRows(permissionsTree)}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RolePermissionsMatrix;