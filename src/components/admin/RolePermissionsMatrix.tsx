import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useAllPermissions, useAllRolePermissions, PermissionNode, RolePermission } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";

const RolePermissionsMatrix: React.FC = () => {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissionsTree = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: allRolePermissions = [], isLoading: rolePermissionsLoading } = useAllRolePermissions();

  const rolePermissionsMap = useMemo(() => {
    const map = new Map<UserRole, Set<string>>();
    allRolePermissions.forEach(rp => {
      if (!map.has(rp.role)) {
        map.set(rp.role, new Set());
      }
      map.get(rp.role)!.add(rp.permission_id);
    });
    return map;
  }, [allRolePermissions]);

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
              {rolePermissionsMap.get(role.name as UserRole)?.has(node.id) ? (
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
              )}
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
        <CardTitle>Ma trận Phân quyền theo Vai trò</CardTitle>
        <CardDescription>
          Bảng này hiển thị các quyền mặc định cho mỗi vai trò. Quyền của người dùng có thể được ghi đè riêng.
        </CardDescription>
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