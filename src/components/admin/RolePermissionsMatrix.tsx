import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Search, Filter, RotateCcw, Check, X, ChevronRight, ChevronDown, Plus, Minus } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useAllPermissions, useAllRolePermissions, useUpdateRolePermissions, Permission } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const getPermissionDisplayName = (name: string, description: string | null): string => {
  return description || name;
};

const roleDisplayNameMap: Record<string, string> = {
  'admin': 'Admin',
  'leader': 'Team Leader', 
  'chuyên viên': 'Chuyên Viên',
  'học việc/thử việc': 'Học Việc/Thử Việc',
  'trưởng phòng': 'Trưởng Phòng',
};

const getRoleDisplayName = (roleValue: string): string => {
  return roleDisplayNameMap[roleValue.toLowerCase()] || roleValue;
};

// Convert display name to database enum value
const roleDisplayToEnum = (displayName: string): string => {
  const mapping: Record<string, string> = {
    'Super Admin': 'admin',
    'Leader': 'leader', 
    'Chuyên Viên': 'chuyên viên',
    'Học Việc/Thử Việc': 'học việc/thử việc',
    'Trưởng Phòng': 'trưởng phòng',
  };
  return mapping[displayName] || displayName.toLowerCase();
};

// Memoized role checkbox component for performance
const RoleCheckbox = memo<{
  role: UserRole;
  permissionId: string;
  checked: boolean;
  onChange: (role: UserRole, permissionId: string, checked: boolean) => void;
}>(({ role, permissionId, checked, onChange }) => {
  const handleChange = useCallback((checkedValue: boolean) => {
    onChange(role, permissionId, checkedValue);
  }, [role, permissionId, onChange]);
  
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={handleChange}
    />
  );
});
RoleCheckbox.displayName = 'RoleCheckbox';

const RolePermissionsMatrix: React.FC = () => {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: allRolePermissions = [], isLoading: rolePermissionsLoading } = useAllRolePermissions();
  const updateRolePermissions = useUpdateRolePermissions();

  const [permissionState, setPermissionState] = useState<Record<string, Set<string>>>({});
  const [modifiedRoles, setModifiedRoles] = useState<Set<UserRole>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showOnlyModified, setShowOnlyModified] = useState(false);

  useEffect(() => {
    if (allRolePermissions.length > 0) {
      const map: Record<string, Set<string>> = {};
      allRolePermissions.forEach(rp => {
        const roleKey = rp.role.toLowerCase() as UserRole;
        if (!map[roleKey]) {
          map[roleKey] = new Set();
        }
        map[roleKey].add(rp.permission_id);
      });
      setPermissionState(map);
    }
  }, [allRolePermissions]);

  const handlePermissionChange = useCallback((role: UserRole, permissionId: string, checked: boolean) => {
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
  }, []);

  const handleSave = useCallback(async () => {
    const promises = Array.from(modifiedRoles).map(role => {
      const permissionIds = Array.from(permissionState[role] || []);
      return updateRolePermissions.mutateAsync({ role: role.toLowerCase() as UserRole, permissionIds });
    });

    await Promise.all(promises);
    setModifiedRoles(new Set());
  }, [modifiedRoles, permissionState, updateRolePermissions]);

  const roleOrder: UserRole[] = ['admin', 'trưởng phòng', 'leader', 'chuyên viên', 'học việc/thử việc'];

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => {
      const enumA = roleDisplayToEnum(a.name) as UserRole;
      const enumB = roleDisplayToEnum(b.name) as UserRole;
      const indexA = roleOrder.indexOf(enumA);
      const indexB = roleOrder.indexOf(enumB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [roles]);

  const filteredRoles = useMemo(() => {
    if (selectedRole === 'all') return sortedRoles;
    return sortedRoles.filter(role => roleDisplayToEnum(role.name) === selectedRole);
  }, [sortedRoles, selectedRole]);
  
  const filteredPermissions = useMemo(() => {
    let filtered = permissions;
    if (searchTerm) {
      filtered = filtered.filter(p => getPermissionDisplayName(p.name, p.description).toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (showOnlyModified) {
      filtered = filtered.filter(p => 
        Array.from(modifiedRoles).some(role => {
          const currentState = permissionState[role]?.has(p.id) || false;
          const originalState = allRolePermissions.some(rp => rp.role.toLowerCase() === role && rp.permission_id === p.id);
          return currentState !== originalState;
        })
      );
    }
    return filtered;
  }, [permissions, searchTerm, showOnlyModified, modifiedRoles, permissionState, allRolePermissions]);

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Quyền theo vai trò</CardTitle>
              <CardDescription>Thiết lập quyền hạn mặc định cho từng vai trò trong hệ thống.</CardDescription>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={modifiedRoles.size === 0 || updateRolePermissions.isPending}
            >
              {updateRolePermissions.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu thay đổi ({modifiedRoles.size})
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm quyền hạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {sortedRoles.map(role => (
                    <SelectItem key={role.id} value={roleDisplayToEnum(role.name)}>
                      {role.description || getRoleDisplayName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-modified"
                  checked={showOnlyModified}
                  onCheckedChange={setShowOnlyModified}
                />
                <Label htmlFor="show-modified" className="text-sm">
                  Chỉ hiển thị thay đổi
                </Label>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="min-w-[250px]">Quyền hạn</TableHead>
                    {filteredRoles.map(role => (
                      <TableHead key={role.id} className="text-center min-w-[140px]">
                        {role.description || getRoleDisplayName(role.name)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {getPermissionDisplayName(permission.name, permission.description)}
                      </TableCell>
                      {filteredRoles.map(role => {
                        const enumRole = roleDisplayToEnum(role.name) as UserRole;
                        return (
                          <TableCell key={role.id} className="text-center">
                            <RoleCheckbox
                              role={enumRole}
                              permissionId={permission.id}
                              checked={permissionState[enumRole]?.has(permission.id) || false}
                              onChange={handlePermissionChange}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RolePermissionsMatrix;