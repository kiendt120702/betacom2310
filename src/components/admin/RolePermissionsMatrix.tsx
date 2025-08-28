import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useAllPermissions, useAllRolePermissions, useUpdateRolePermissions, PermissionNode } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";

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
    switch (roleValue.toLowerCase()) {
      case 'admin': return 'Super Admin';
      case 'leader': return 'Team Leader';
      case 'chuyên viên': return 'Chuyên Viên';
      case 'học việc/thử việc': return 'Học Việc/Thử Việc';
      case 'trưởng phòng': return 'Trưởng Phòng';
      default: return roleValue;
    }
  };

  const renderPermissionRows = (nodes: PermissionNode[], level = 0): JSX.Element[] => {
    return nodes.flatMap(node => {
      const row = (
        <TableRow key={node.id}>
          <TableCell style={{ paddingLeft: `${level * 24 + 16}px` }}>
            {node.name}
          </TableCell>
          {roles.map(role => (
            <TableCell key={role.id} className="text-center">
              <Checkbox
                checked={permissionState[role.name as UserRole]?.has(node.id) || false}
                onCheckedChange={(checked) => handlePermissionChange(role.name as UserRole, node.id, !!checked)}
              />
            </TableCell>
          ))}
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quyền hạn</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center">{getRoleDisplayName(role.name)}</TableHead>
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