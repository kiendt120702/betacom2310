import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Search, Filter, RotateCcw, Check, X, ChevronRight, ChevronDown } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useAllPermissions, useAllRolePermissions, useUpdateRolePermissions, PermissionNode } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

const RolePermissionsMatrix: React.FC = () => {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissionsTree = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: allRolePermissions = [], isLoading: rolePermissionsLoading } = useAllRolePermissions();
  const updateRolePermissions = useUpdateRolePermissions();

  const [permissionState, setPermissionState] = useState<Record<string, Set<string>>>({});
  const [modifiedRoles, setModifiedRoles] = useState<Set<UserRole>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showOnlyModified, setShowOnlyModified] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(new Set());

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
      return updateRolePermissions.mutateAsync({ role, permissionIds });
    });

    await Promise.all(promises);
    setModifiedRoles(new Set());
  }, [modifiedRoles, permissionState, updateRolePermissions]);
  
  const togglePermissionExpansion = useCallback((permissionId: string) => {
    setExpandedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  }, []);
  
  const handleBulkRoleAction = useCallback((role: UserRole, action: 'grant-all' | 'revoke-all' | 'reset') => {
    if (action === 'grant-all') {
      const allPermissionIds: string[] = [];
      const collectIds = (nodes: PermissionNode[]) => {
        nodes.forEach(node => {
          allPermissionIds.push(node.id);
          if (node.children) collectIds(node.children);
        });
      };
      collectIds(permissionsTree);
      
      setPermissionState(prev => ({
        ...prev,
        [role]: new Set(allPermissionIds)
      }));
    } else if (action === 'revoke-all') {
      setPermissionState(prev => ({
        ...prev,
        [role]: new Set()
      }));
    } else if (action === 'reset') {
      const originalPermissions = allRolePermissions
        .filter(rp => rp.role === role)
        .map(rp => rp.permission_id);
      
      setPermissionState(prev => ({
        ...prev,
        [role]: new Set(originalPermissions)
      }));
    }
    setModifiedRoles(prev => new Set(prev).add(role));
  }, [permissionsTree, allRolePermissions]);
  
  const handleExpandAll = useCallback(() => {
    const allParentIds: string[] = [];
    const collectParentIds = (nodes: PermissionNode[]) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          allParentIds.push(node.id);
          collectParentIds(node.children);
        }
      });
    };
    collectParentIds(permissionsTree);
    setExpandedPermissions(new Set(allParentIds));
  }, [permissionsTree]);
  
  const handleCollapseAll = useCallback(() => {
    setExpandedPermissions(new Set());
  }, []);

  const getRoleDisplayName = (roleValue: string): string => {
    return roleDisplayNameMap[roleValue.toLowerCase()] || roleValue;
  };

  // Filter permissions based on search and role filter
  const filteredPermissions = useMemo(() => {
    let filtered = permissionsTree;
    
    if (searchTerm) {
      const filterBySearch = (nodes: PermissionNode[]): PermissionNode[] => {
        return nodes.filter(node => {
          const displayName = getPermissionDisplayName(node.name);
          const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
          
          const filteredChildren = node.children.length > 0 ? filterBySearch(node.children) : [];
          
          return matchesSearch || filteredChildren.length > 0;
        }).map(node => ({
          ...node,
          children: node.children.length > 0 ? filterBySearch(node.children) : []
        }));
      };
      filtered = filterBySearch(filtered);
    }
    
    if (showOnlyModified) {
      const filterByModified = (nodes: PermissionNode[]): PermissionNode[] => {
        return nodes.filter(node => {
          const hasModifiedPermission = Array.from(modifiedRoles).some(role => {
            const currentState = permissionState[role]?.has(node.id) || false;
            const originalState = allRolePermissions
              .filter(rp => rp.role === role)
              .some(rp => rp.permission_id === node.id);
            return currentState !== originalState;
          });
          
          const filteredChildren = node.children.length > 0 ? filterByModified(node.children) : [];
          
          return hasModifiedPermission || filteredChildren.length > 0;
        }).map(node => ({
          ...node,
          children: node.children.length > 0 ? filterByModified(node.children) : []
        }));
      };
      filtered = filterByModified(filtered);
    }
    
    return filtered;
  }, [permissionsTree, searchTerm, showOnlyModified, modifiedRoles, permissionState, allRolePermissions]);
  
  // Filter roles if specific role selected
  const filteredRoles = useMemo(() => {
    if (selectedRole === 'all') return roles;
    return roles.filter(role => role.name === selectedRole);
  }, [roles, selectedRole]);
  
  const renderPermissionRows = useCallback((nodes: PermissionNode[], level = 0): JSX.Element[] => {
    return nodes.flatMap(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedPermissions.has(node.id);
      
      const row = (
        <TableRow key={node.id} className="hover:bg-muted/50">
          <TableCell 
            style={{ paddingLeft: `${level * 20 + 16}px` }} 
            className="whitespace-pre-wrap break-words min-w-0"
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => togglePermissionExpansion(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              <span className={hasChildren ? 'font-medium' : ''}>
                {getPermissionDisplayName(node.name)}
              </span>
            </div>
          </TableCell>
          {filteredRoles.map(role => {
            const enumRole = getRoleEnumValue(role.name);
            const isChecked = permissionState[enumRole]?.has(node.id) || false;
            const isModified = modifiedRoles.has(enumRole);
            
            return (
              <TableCell key={role.id} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <RoleCheckbox
                    role={enumRole}
                    permissionId={node.id}
                    checked={isChecked}
                    onChange={handlePermissionChange}
                  />
                  {isModified && isChecked && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                  {isModified && !isChecked && (
                    <X className="h-3 w-3 text-red-600" />
                  )}
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      );
      
      if (hasChildren && isExpanded) {
        return [row, ...renderPermissionRows(node.children, level + 1)];
      }
      return [row];
    });
  }, [filteredRoles, permissionState, modifiedRoles, handlePermissionChange, expandedPermissions, togglePermissionExpansion]);

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Ma trận Phân quyền theo Vai trò</CardTitle>
              <CardDescription>
                Chỉnh sửa các quyền mặc định cho mỗi vai trò. Có {modifiedRoles.size} vai trò đã thay đổi.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExpandAll}
              >
                Mở rộng tất cả
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCollapseAll}
              >
                Thu gọn tất cả
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={modifiedRoles.size === 0 || updateRolePermissions.isPending}
              >
                {updateRolePermissions.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu thay đổi ({modifiedRoles.size})
              </Button>
            </div>
          </div>
          
          {/* Filters and Search */}
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
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {getRoleDisplayName(role.name)}
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
                  Chỉ hiển thay đổi
                </Label>
              </div>
            </div>
          </div>
          
          {/* Modified roles badges */}
          {modifiedRoles.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Vai trò đã thay đổi:</span>
              {Array.from(modifiedRoles).map(role => (
                <Badge key={role} variant="outline" className="gap-1">
                  {getRoleDisplayName(role)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      // Reset specific role to original permissions
                      const originalPermissions = allRolePermissions
                        .filter(rp => rp.role === role)
                        .map(rp => rp.permission_id);
                      
                      setPermissionState(prev => ({
                        ...prev,
                        [role]: new Set(originalPermissions)
                      }));
                      setModifiedRoles(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(role);
                        return newSet;
                      });
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
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
                    <TableHead className="min-w-[250px] max-w-[350px]">
                      <div className="flex items-center gap-2">
                        <span>Quyền hạn</span>
                        <Badge variant="outline" className="text-xs">
                          {filteredPermissions.length} nhóm
                        </Badge>
                      </div>
                    </TableHead>
                    {filteredRoles.map(role => {
                      const enumRole = getRoleEnumValue(role.name);
                      const rolePermissionCount = permissionState[enumRole]?.size || 0;
                      const isModified = modifiedRoles.has(enumRole);
                      
                      return (
                        <TableHead key={role.id} className="text-center min-w-[140px]">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{getRoleDisplayName(role.name)}</span>
                              {isModified && <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full" />}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {rolePermissionCount} quyền
                            </Badge>
                            {/* Bulk actions for role */}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleBulkRoleAction(enumRole, 'grant-all')}
                                title="Chọn tất cả"
                              >
                                All
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleBulkRoleAction(enumRole, 'revoke-all')}
                                title="Bỏ chọn tất cả"
                              >
                                None
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-xs"
                                onClick={() => handleBulkRoleAction(enumRole, 'reset')}
                                title="Khôi phục"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length > 0 ? (
                    renderPermissionRows(filteredPermissions)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={filteredRoles.length + 1} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Filter className="h-8 w-8 opacity-50" />
                          <div>Không có quyền nào phù hợp với bộ lọc</div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedRole('all');
                              setShowOnlyModified(false);
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {/* Summary */}
        {!isLoading && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Hiển thị {filteredPermissions.length} nhóm quyền cho {filteredRoles.length} vai trò
            {(searchTerm || selectedRole !== 'all' || showOnlyModified) && (
              <span> (đã lọc)</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RolePermissionsMatrix;